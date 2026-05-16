import { AudioOutlined, CloseOutlined } from '@ant-design/icons';
import { Select, Tooltip } from 'antd';
import type { VoicePhase } from '@/hooks/useVoiceAssistant';
import { cn } from '@/utils/cn';

const LANGUAGES = [
  { value: 'en-US', label: '🇺🇸 EN' },
  { value: 'ru-RU', label: '🇷🇺 RU' },
  { value: 'kk-KZ', label: '🇰🇿 KZ' },
];

type VoiceModeBarProps = {
  phase: VoicePhase;
  transcript: string;
  lang: string;
  onLangChange: (lang: string) => void;
  onInterrupt: () => void;
  onExit: () => void;
};

const WAVE_HEIGHTS = [10, 18, 24, 18, 10];

export function VoiceModeBar({ phase, transcript, lang, onLangChange, onInterrupt, onExit }: VoiceModeBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'flex items-center gap-4 rounded-2xl border p-4 shadow-lg shadow-black/20 transition-colors duration-300',
          phase === 'listening' && 'border-green-500/30 bg-green-500/5',
          phase === 'thinking' && 'border-blue-500/30 bg-blue-500/5',
          phase === 'speaking' && 'border-purple-500/30 bg-purple-500/5',
        )}
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          {phase === 'listening' && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-green-500/25" />
              <span className="absolute inset-1 animate-pulse rounded-full bg-green-500/15" />
              <AudioOutlined className="relative z-10 text-xl text-green-400" />
            </>
          )}

          {phase === 'thinking' && (
            <div className="flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}

          {phase === 'speaking' && (
            <div className="flex items-end gap-[3px]">
              {WAVE_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="animate-bounce rounded-full bg-purple-400"
                  style={{
                    width: '3px',
                    height: `${h}px`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              'text-sm font-semibold',
              phase === 'listening' && 'text-green-400',
              phase === 'thinking' && 'text-blue-400',
              phase === 'speaking' && 'text-purple-400',
            )}
          >
            {phase === 'listening' && '🎤 Listening…'}
            {phase === 'thinking' && '⏳ Thinking…'}
            {phase === 'speaking' && '🔊 Speaking…'}
          </span>
          <span className="truncate text-xs text-[var(--chat-text-muted)]">
            {phase === 'listening' && (transcript || 'Say something…')}
            {phase === 'thinking' && 'Processing your question'}
            {phase === 'speaking' && 'Just start talking to interrupt'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {phase === 'speaking' && (
            <Tooltip title="Interrupt & speak">
              <button
                type="button"
                onClick={onInterrupt}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-transparent text-purple-400 transition hover:bg-purple-500/10"
                aria-label="Interrupt AI and speak"
              >
                <AudioOutlined className="text-base" />
              </button>
            </Tooltip>
          )}

          <Tooltip title="Exit voice mode">
            <button
              type="button"
              onClick={onExit}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--chat-border)] bg-transparent text-[var(--chat-text-muted)] transition hover:border-red-500/30 hover:text-red-400"
              aria-label="Exit voice mode"
            >
              <CloseOutlined className="text-base" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--chat-text-muted)]">
          Hands-free AI · Chrome & Edge only
        </p>
        <Select
          size="small"
          value={lang}
          onChange={onLangChange}
          options={LANGUAGES}
          className="w-28"
          disabled={phase === 'thinking'}
        />
      </div>
    </div>
  );
}
