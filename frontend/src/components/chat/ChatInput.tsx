import { ArrowRightOutlined } from '@ant-design/icons';
import { Input, message as antdMessage } from 'antd';
import { type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { cn } from '@/utils/cn';
import { VoiceButton } from './VoiceButton';

export function ChatInput() {
  const [value, setValue] = useState('');
  const { isLoading, sendMessage, stopGenerating } = useChat();

  const submitPrompt = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return false;
      setValue('');
      await sendMessage(trimmed);
      return true;
    },
    [isLoading, sendMessage],
  );

  const {
    transcript,
    listening,
    supported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      void submitPrompt(text);
    },
  });

  useEffect(() => {
    if (listening && transcript) {
      setValue(transcript);
    }
  }, [transcript, listening]);

  useEffect(() => {
    if (error) {
      antdMessage.warning(error);
    }
  }, [error]);

  const handleSend = async () => {
    if (listening) {
      stopListening();
      return;
    }
    if (isLoading) {
      stopGenerating();
      return;
    }
    await submitPrompt(value);
    resetTranscript();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const placeholder = listening
    ? 'Listening…'
    : isLoading
      ? 'AI is responding…'
      : 'Ask whatever you want';

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border border-[var(--chat-border)] bg-[var(--chat-surface)] px-3 py-2 shadow-lg shadow-black/20 transition',
          listening && 'border-[var(--chat-primary)]',
        )}
      >
        <VoiceButton
          listening={listening}
          supported={supported}
          disabled={isLoading}
          onStart={startListening}
          onStop={stopListening}
        />

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          readOnly={listening}
          variant="borderless"
          className="!flex-1 !text-[15px] !text-white placeholder:!text-[var(--chat-text-muted)]"
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={(!value.trim() && !listening && !isLoading) || (isLoading && !listening)}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--chat-primary)] text-white transition hover:bg-[var(--chat-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40',
          )}
          aria-label={isLoading ? 'Stop generating' : 'Send message'}
        >
          {isLoading && !listening ? (
            <span className="text-xs font-semibold">■</span>
          ) : (
            <ArrowRightOutlined className="text-lg" />
          )}
        </button>
      </div>
      {listening && (
        <p className="text-center text-xs text-[var(--chat-text-muted)]">
          Recording… tap mic or send when done
        </p>
      )}
    </div>
  );
}
