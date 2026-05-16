import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionInstance = InstanceType<
  typeof window.SpeechRecognition
>;

type UseSpeechRecognitionOptions = {
  /** Called with the final transcript when recording ends successfully */
  onFinalTranscript?: (text: string) => void;
  lang?: string;
};

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onFinalTranscript, lang = 'en-US' } = options;
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTextRef = useRef('');

  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += text;
        } else {
          interim += text;
        }
      }

      if (finalChunk) {
        finalTextRef.current = `${finalTextRef.current}${finalChunk}`.trim();
      }

      const display = finalTextRef.current || interim;
      setTranscript(display);
    };

    recognition.onend = () => {
      setListening(false);
      const finalText = finalTextRef.current.trim();
      if (finalText) {
        onFinalRef.current?.(finalText);
      }
      finalTextRef.current = '';
    };

    recognition.onerror = (event: Event) => {
      setListening(false);
      const code =
        'error' in event ? String((event as SpeechRecognitionErrorEvent).error) : '';

      if (code === 'no-speech') {
        setError('No speech detected. Try again.');
      } else if (code === 'not-allowed') {
        setError('Microphone access denied. Allow mic permission in browser settings.');
      } else if (code !== 'aborted') {
        setError('Voice recognition failed. Try again.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        // ignore if not running
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setError(null);
    setTranscript('');
    finalTextRef.current = '';

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setError('Could not start microphone. Try again.');
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTextRef.current = '';
  }, []);

  return {
    transcript,
    listening,
    supported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
