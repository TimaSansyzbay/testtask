import { CopyOutlined, RedoOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { message as antdMessage, Tooltip } from 'antd';
import type { Message } from '@/types/chat.types';
import { cn } from '@/utils/cn';
import { MarkdownContent } from './MarkdownContent';

type MessageBubbleProps = {
  message: Message;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
};

export function MessageBubble({
  message,
  onRegenerate,
  showRegenerate = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      antdMessage.success('Copied to clipboard');
    } catch {
      antdMessage.error('Failed to copy');
    }
  };

  if (!message.content && message.role === 'assistant') {
    return null;
  }

  return (
    <div
      className={cn(
        'group flex w-full gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          isUser ? 'bg-[var(--chat-user-bubble)]' : 'bg-[var(--chat-primary)]',
        )}
      >
        {isUser ? (
          <UserOutlined className="text-sm text-white" />
        ) : (
          <RobotOutlined className="text-sm text-white" />
        )}
      </div>

      <div
        className={cn(
          'min-w-0 flex flex-col gap-1',
          isUser ? 'max-w-[min(82%,38rem)] items-end' : 'max-w-[min(90%,46rem)] items-start',
        )}
      >
        <div
          className={cn(
            'max-w-full rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
            isUser
              ? 'rounded-tr-md bg-[var(--chat-user-bubble)] text-white'
              : 'w-full overflow-x-auto rounded-tl-md border border-[var(--chat-border)] bg-[var(--chat-ai-bubble)] text-white',
          )}
        >
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>

        {!isUser && message.content && (
          <div className="flex h-5 items-center gap-2 px-1 opacity-0 transition group-hover:opacity-100">
            <Tooltip title="Copy">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="border-0 bg-transparent text-[var(--chat-text-muted)] hover:text-white"
                aria-label="Copy message"
              >
                <CopyOutlined />
              </button>
            </Tooltip>
            {showRegenerate && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 border-0 bg-transparent text-xs text-[var(--chat-text-muted)] hover:text-white"
              >
                <RedoOutlined />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
