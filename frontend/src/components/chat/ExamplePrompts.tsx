const PROMPTS = [
  'Explain React hooks in simple terms',
  'Write a TypeScript function to debounce API calls',
  'What are good practices for REST API design?',
  'Help me debug a CORS error',
];

type ExamplePromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function ExamplePrompts({ onSelect, disabled }: ExamplePromptsProps) {
  return (
    <div className="flex flex-col gap-3">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="rounded-xl border border-[var(--chat-border)] bg-[var(--chat-surface)] px-4 py-3 text-left text-sm text-[var(--chat-text-muted)] transition hover:border-[var(--chat-primary)] hover:bg-[var(--chat-surface-elevated)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
