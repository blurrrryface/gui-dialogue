import { ChatProvider } from '@/components/ChatProvider';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { MultiAgentDemo } from '@/components/chat/MultiAgentDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <ChatProvider>
      <div className="h-screen">
        <Tabs defaultValue="chat" className="h-full">
          <div className="border-b">
            <div className="container mx-auto px-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chat">聊天界面</TabsTrigger>
                <TabsTrigger value="demo">多Agent演示</TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="chat" className="h-full mt-0">
            <ChatLayout />
          </TabsContent>
          
          <TabsContent value="demo" className="h-full mt-0 p-4 overflow-auto">
            <MultiAgentDemo />
          </TabsContent>
        </Tabs>
      </div>
    </ChatProvider>
  );
};

export default Index;