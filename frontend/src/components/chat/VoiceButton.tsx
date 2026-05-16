import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { cn } from '@/utils/cn';

type VoiceButtonProps = {
  listening?: boolean;
  supported?: boolean;
  disabled?: boolean;
  onStart?: () => void;
  onStop?: () => void;
};

export function VoiceButton({
  listening = false,
  supported = true,
  disabled = false,
  onStart,
  onStop,
}: VoiceButtonProps) {
  const handleClick = () => {
    if (listening) {
      onStop?.();
    } else {
      onStart?.();
    }
  };

  const tooltip = !supported
    ? 'Voice input requires Chrome or Edge'
    : listening
      ? 'Stop & send'
      : 'Voice input';

  return (
    <Tooltip title={tooltip}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!supported || disabled}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-[var(--chat-text-muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40',
          listening && 'animate-pulse text-[var(--chat-primary)]',
        )}
        aria-label={listening ? 'Stop recording' : 'Start voice input'}
        aria-pressed={listening}
      >
        {listening ? (
          <AudioMutedOutlined className="text-xl" />
        ) : (
          <AudioOutlined className="text-xl" />
        )}
      </button>
    </Tooltip>
  );
}
