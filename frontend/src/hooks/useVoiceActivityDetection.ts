import { useCallback, useRef } from 'react';

const VOLUME_THRESHOLD = 10;
const SUSTAINED_FRAMES = 6;

export function useVoiceActivityDetection(onSpeech: () => void) {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const onSpeechRef = useRef(onSpeech);
  onSpeechRef.current = onSpeech;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close();
    ctxRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      ctxRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;
      streamRef.current = stream;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let loudFrames = 0;
      let fired = false;

      const tick = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = ((data[i] ?? 128) - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length) * 100;

        if (rms > VOLUME_THRESHOLD) {
          loudFrames += 1;
          if (!fired && loudFrames >= SUSTAINED_FRAMES) {
            fired = true;
            onSpeechRef.current();
          }
        } else {
          loudFrames = 0;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // mic permission denied or unavailable — fail silently
    }
  }, [stop]);

  return { start, stop };
}
