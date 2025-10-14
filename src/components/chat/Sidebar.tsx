import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MessageSquare, Trash2, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

// 预定义的 Graph ID 选项
const GRAPH_OPTIONS = [
  { id: 'langgraph-app', name: 'LangGraph App', description: '默认应用' },
  { id: 'chat-agent', name: 'Chat Agent', description: '聊天代理' },
  { id: 'rag-system', name: 'RAG System', description: '检索增强生成' },
  { id: 'code-assistant', name: 'Code Assistant', description: '代码助手' },
  { id: 'data-analyst', name: 'Data Analyst', description: '数据分析' },
];

export function Sidebar({ className }: SidebarProps) {
  const {
    threads,
    currentThreadId,
    graphId,
    createThread,
    selectThread,
    deleteThread,
    setGraphId,
  } = useChatStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNewChat = () => {
    createThread();
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  const handleGraphIdChange = (newGraphId: string) => {
    setGraphId(newGraphId);
    setIsSettingsOpen(false);
  };

  const getCurrentGraph = () => {
    return GRAPH_OPTIONS.find(option => option.id === graphId) || GRAPH_OPTIONS[0];
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 overflow-hidden">
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
                    className="w-6 h-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="p-4 border-t border-border space-y-3">
        {/* Graph ID Selection */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground px-2">
            Current Graph
          </div>
          <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between text-left h-auto py-2"
                size="sm"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {getCurrentGraph().name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getCurrentGraph().description}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-64 bg-background border border-border shadow-lg z-50"
            >
              {GRAPH_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleGraphIdChange(option.id)}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    option.id === graphId && "bg-accent"
                  )}
                >
                  <div className="font-medium text-sm">{option.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    ID: {option.id}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Settings Button */}
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}