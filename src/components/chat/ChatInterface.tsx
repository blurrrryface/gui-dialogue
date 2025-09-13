import React from 'react';
import { Thread } from '@/components/assistant-ui/thread';
import { useCurrentThread, useChatStore } from '@/store/chatStore';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      className
    )}>
      {/* Using assistant-ui Thread component for complete chat interface */}
      <Thread />
    </div>
  );
}