export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[var(--chat-border)] bg-[var(--chat-ai-bubble)] px-4 py-3">
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--chat-text-muted)] [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--chat-text-muted)] [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--chat-text-muted)] [animation-delay:300ms]" />
    </div>
  );
}
