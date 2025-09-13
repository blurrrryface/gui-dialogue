import React from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    threads,
    currentThreadId,
    createThread,
    selectThread,
    deleteThread,
  } = useChatStore();

  const handleNewChat = () => {
    createThread();
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar-background border-r border-border",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={handleNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-4">
          {threads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
                  "hover:bg-sidebar-hover",
                  currentThreadId === thread.id 
                    ? "bg-sidebar-active border border-border/50" 
                    : "border border-transparent"
                )}
                onClick={() => selectThread(thread.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(thread.updatedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}