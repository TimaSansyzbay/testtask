import { Alert, Button } from 'antd';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chat.store';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';

export function MessageList() {
  const { error, status, isLoading, regenerate, retry, canRegenerate, sendMessage } =
    useChat();
  const messages = useChatStore((state) => state.messages);

  const bottomRef = useAutoScroll([messages, status]);

  const lastMessage = messages.at(-1);
  const showTyping =
    status === 'streaming' &&
    lastMessage?.role === 'assistant' &&
    lastMessage.content.length === 0;

  if (messages.length === 0) {
    return (
      <WelcomeScreen
        disabled={isLoading}
        onSelectPrompt={(prompt) => void sendMessage(prompt)}
      />
    );
  }

  const lastAssistantIndex = messages.findLastIndex(
    (m) => m.role === 'assistant',
  );

  return (
    <div className="chat-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
      {error && status === 'error' && (
        <Alert
          type="error"
          message={error}
          showIcon
          className="!rounded-xl !border-[var(--chat-border)] !bg-[var(--chat-surface)]"
          action={
            <Button size="small" type="primary" onClick={() => void retry()}>
              Retry
            </Button>
          }
        />
      )}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          showRegenerate={index === lastAssistantIndex && canRegenerate}
          onRegenerate={() => void regenerate()}
        />
      ))}
      {showTyping && (
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chat-primary)]">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
          <TypingIndicator />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
