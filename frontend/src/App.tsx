import { ChatContainer } from '@/components/chat/ChatContainer';

function App() {
  return (
    <div className="flex h-full min-h-screen flex-col overflow-x-hidden bg-[var(--chat-bg)]">
      <ChatContainer />
    </div>
  );
}

export default App;
