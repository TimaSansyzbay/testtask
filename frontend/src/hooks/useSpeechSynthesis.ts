import { useCallback, useEffect, useRef, useState } from 'react';

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ', code block,')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const onEndCallbackRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((rawText: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const text = stripMarkdown(rawText);
    if (!text) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    onEndCallbackRef.current = onEnd;

    utterance.onend = () => {
      setSpeaking(false);
      const cb = onEndCallbackRef.current;
      onEndCallbackRef.current = undefined;
      cb?.();
    };

    utterance.onerror = () => {
      setSpeaking(false);
      const cb = onEndCallbackRef.current;
      onEndCallbackRef.current = undefined;
      cb?.();
    };

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    onEndCallbackRef.current = undefined;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}
