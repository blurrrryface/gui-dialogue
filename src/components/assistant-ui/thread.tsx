import type { FC } from "react";
import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  CircleStopIcon,
  SendHorizontalIcon,
  PencilIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
        <ThreadWelcome />
        
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
            EditComposer: EditComposer,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="h-4" />
        </ThreadPrimitive.If>

        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <Button
        variant="outline"
        size="icon"
        className="mb-2 w-8 h-8"
      >
        <ArrowDownIcon className="w-4 h-4" />
      </Button>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
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
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex items-end gap-2 bg-card rounded-lg border border-border p-3">
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder="Type your message..."
        className="flex-1 bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground"
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <Button size="icon" className="w-8 h-8 bg-primary hover:bg-primary/90">
            <SendHorizontalIcon className="w-4 h-4" />
          </Button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button size="icon" variant="outline" className="w-8 h-8">
            <CircleStopIcon className="w-4 h-4" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-end p-4">
      <UserActionBar />
      <div className="bg-chat-bubble-user text-chat-bubble-user-foreground rounded-2xl px-4 py-3 max-w-3xl">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-start p-4">
      <div className="bg-chat-bubble-assistant text-chat-bubble-assistant-foreground rounded-2xl px-4 py-3 max-w-3xl">
        <MessagePrimitive.Parts />
      </div>
      <AssistantActionBar />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex items-center gap-1 mr-2"
    >
      <ActionBarPrimitive.Edit asChild>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <PencilIcon className="w-3 h-3" />
        </Button>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex items-center gap-1 ml-2"
    >
      <ActionBarPrimitive.Copy asChild>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <CircleStopIcon className="w-3 h-3" />
        </Button>
      </ActionBarPrimitive.Copy>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted rounded-lg border border-border p-3 my-2">
      <ComposerPrimitive.Input className="w-full bg-transparent border-0 outline-none resize-none text-sm" />
      <div className="flex gap-2 mt-2">
        <ComposerPrimitive.Send asChild>
          <Button size="sm">Save</Button>
        </ComposerPrimitive.Send>
        <ComposerPrimitive.Cancel asChild>
          <Button size="sm" variant="outline">Cancel</Button>
        </ComposerPrimitive.Cancel>
      </div>
    </ComposerPrimitive.Root>
  );
};