import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - simplified for now */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-sidebar-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="flex-1 p-4">
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Chat history will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <h1 className="text-lg font-semibold">AI Chat</h1>
        </div>

        {/* Chat interface */}
        <ChatInterface className="flex-1" />
      </div>
    </div>
  );
}