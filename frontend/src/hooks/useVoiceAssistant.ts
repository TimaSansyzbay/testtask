import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useChat } from './useChat';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';

export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking';

const BROWSER_LANG = navigator.language || 'en-US';

export function useVoiceAssistant() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [lang, setLang] = useState(BROWSER_LANG);

  const activeRef = useRef(false);
  const phaseRef = useRef<VoicePhase>('idle');

  const syncPhase = useCallback((p: VoicePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const { sendMessage, status } = useChat();
  const { speak, stop: stopSpeaking, speaking } = useSpeechSynthesis();

  const { transcript, listening, supported, error, startListening, stopListening } =
    useSpeechRecognition({
      lang,
      onFinalTranscript: (text: string) => {
        if (!activeRef.current) return;
        syncPhase('thinking');
        void sendMessage(text, { voiceMode: true });
      },
    });

  const startListeningRef = useRef(startListening);
  startListeningRef.current = startListening;
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const syncPhaseRef = useRef(syncPhase);
  syncPhaseRef.current = syncPhase;

  const handleVoiceDetected = useCallback(() => {
    if (phaseRef.current !== 'speaking') return;
    stopSpeaking();
    syncPhaseRef.current('listening');
    startListeningRef.current();
  }, [stopSpeaking]);

  const { start: startVad, stop: stopVad } = useVoiceActivityDetection(handleVoiceDetected);

  useEffect(() => {
    if (phase === 'speaking') {
      void startVad();
    } else {
      stopVad();
    }
  }, [phase, startVad, stopVad]);

  useEffect(() => {
    if (!activeRef.current || phaseRef.current !== 'thinking') return;

    if (status === 'idle') {
      const messages = useChatStore.getState().messages;
      const lastAssistant = messages.findLast((m) => m.role === 'assistant');

      if (lastAssistant?.content) {
        syncPhaseRef.current('speaking');
        speakRef.current(lastAssistant.content, () => {
          if (activeRef.current) {
            syncPhaseRef.current('listening');
            startListeningRef.current();
          }
        });
      } else {
        syncPhaseRef.current('listening');
        startListeningRef.current();
      }
    } else if (status === 'error') {
      syncPhaseRef.current('listening');
      startListeningRef.current();
    }
  }, [status]);

  useEffect(() => {
    if (!activeRef.current || phaseRef.current !== 'listening') return;
    if (listening) return;

    const timeout = setTimeout(() => {
      if (activeRef.current && phaseRef.current === 'listening') {
        startListeningRef.current();
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [listening]);

  const enter = useCallback(() => {
    activeRef.current = true;
    setActive(true);
    syncPhase('listening');
    startListening();
  }, [startListening, syncPhase]);

  const exit = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    syncPhase('idle');
    stopListening();
    stopSpeaking();
    stopVad();
  }, [stopListening, stopSpeaking, stopVad, syncPhase]);

  const interrupt = useCallback(() => {
    stopSpeaking();
    if (activeRef.current) {
      syncPhase('listening');
      startListening();
    }
  }, [stopSpeaking, startListening, syncPhase]);

  const changeLang = useCallback((newLang: string) => {
    stopListening();
    setLang(newLang);
  }, [stopListening]);

  return {
    active,
    phase,
    transcript,
    listening,
    speaking,
    supported,
    error,
    lang,
    setLang: changeLang,
    enter,
    exit,
    interrupt,
  };
}
