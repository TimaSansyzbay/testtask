import { CustomerServiceOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';
import { useChat } from '@/hooks/useChat';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { cn } from '@/utils/cn';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { VoiceModeBar } from './VoiceModeBar';

export function ChatContainer() {
  const { clearMessages, messages, isLoading } = useChat();
  const { active, phase, transcript, supported, enter, exit, interrupt } = useVoiceAssistant();
  const hasMessages = messages.length > 0;

  return (
    <div className="mx-auto flex h-screen w-full max-w-4xl flex-col overflow-x-hidden">
      <header className="flex items-center justify-between px-6 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--chat-primary)] shadow-lg shadow-blue-900/20">
          <MessageOutlined className="text-lg text-white" />
        </div>

        <div className="flex items-center gap-1">
          {supported && (
            <Tooltip title={active ? 'Exit voice mode' : 'Hands-free voice mode'}>
              <button
                type="button"
                onClick={active ? exit : enter}
                aria-label={active ? 'Exit voice mode' : 'Activate voice mode'}
                className={cn(
                  'relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-300',
                  active
                    ? 'bg-[var(--chat-primary)] text-white shadow-lg shadow-blue-900/40'
                    : 'bg-gradient-to-r from-violet-600/20 to-blue-600/20 text-violet-300 hover:from-violet-600/30 hover:to-blue-600/30 hover:text-white',
                )}
              >
                {!active && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
                )}
                <CustomerServiceOutlined className="relative z-10 text-base" />
                <span className="relative z-10 hidden sm:inline">
                  {active ? 'Voice On' : 'Voice'}
                </span>
              </button>
            </Tooltip>
          )}

          {hasMessages && !active && (
            <Popconfirm
              title="Clear conversation?"
              description="All messages will be removed."
              onConfirm={clearMessages}
              okText="Clear"
              cancelText="Cancel"
              disabled={isLoading}
            >
              <Tooltip title="Clear chat">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  disabled={isLoading}
                  className="!text-[var(--chat-text-muted)] hover:!text-white"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <MessageList />
      </main>

      <footer className="shrink-0 px-6 pb-6 pt-3">
        {active ? (
          <VoiceModeBar
            phase={phase}
            transcript={transcript}
            onInterrupt={interrupt}
            onExit={exit}
          />
        ) : (
          <ChatInput />
        )}
      </footer>
    </div>
  );
}
