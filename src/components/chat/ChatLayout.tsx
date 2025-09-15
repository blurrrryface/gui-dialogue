import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

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

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-sidebar-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border p-4 flex items-center gap-3 flex-shrink-0">
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
          <h1 className="text-lg font-semibold flex-1">AI Chat</h1>
          <ThemeToggle />
        </div>

        {/* Desktop header with theme toggle */}
        <div className="hidden lg:block border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">AI Chat</h1>
            <ThemeToggle />
          </div>
        </div>

        {/* Chat interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}