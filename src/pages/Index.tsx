import { ChatProvider } from '@/components/ChatProvider';
import { ChatLayout } from '@/components/chat/ChatLayout';

const Index = () => {
  return (
    <ChatProvider>
      <div className="h-screen">
        <ChatLayout />
      </div>
    </ChatProvider>
  );
};

export default Index;
