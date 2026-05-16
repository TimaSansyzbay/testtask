import { ExamplePrompts } from './ExamplePrompts';

type WelcomeScreenProps = {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
};

export function WelcomeScreen({ onSelectPrompt, disabled }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col justify-center px-4 pb-8 pt-4 sm:px-6">
      <div className="max-w-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white md:text-3xl">
          Hi there!
        </h1>
        <h2 className="mb-6 text-3xl font-bold leading-tight text-white md:text-4xl">
          What would you like to know?
        </h2>
        <p className="mb-8 max-w-md text-base text-[var(--chat-text-muted)]">
          Use one of the most common prompts below or ask your own question
        </p>
        <ExamplePrompts disabled={disabled} onSelect={onSelectPrompt} />
      </div>
    </div>
  );
}
