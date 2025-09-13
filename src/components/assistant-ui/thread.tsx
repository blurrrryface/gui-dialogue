import type { FC } from "react";
import {
  ComposerPrimitive,
  ThreadPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { SendHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="flex justify-end p-4">
    <div className="bg-chat-bubble-user text-chat-bubble-user-foreground rounded-2xl px-4 py-3 max-w-3xl">
      <MessagePrimitive.Parts />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="flex justify-start p-4">
    <div className="bg-chat-bubble-assistant text-chat-bubble-assistant-foreground rounded-2xl px-4 py-3 max-w-3xl">
      <MessagePrimitive.Parts />
    </div>
  </MessagePrimitive.Root>
);

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <ThreadPrimitive.Empty>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="text-4xl">💬</div>
              <h3 className="text-lg font-medium">How can I help you today?</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Start a conversation with your AI assistant powered by LangGraph.
              </p>
            </div>
          </div>
        </ThreadPrimitive.Empty>
        
        <ThreadPrimitive.Messages 
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <div className="border-t border-border p-4">
        <ComposerPrimitive.Root className="flex items-end gap-2 bg-card rounded-lg border border-border p-3">
          <ComposerPrimitive.Input
            autoFocus
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground max-h-32"
          />
          <ComposerPrimitive.Send asChild>
            <Button size="icon" className="w-8 h-8 bg-primary hover:bg-primary/90">
              <SendHorizontalIcon className="w-4 h-4" />
            </Button>
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
};