import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { Sidebar } from './Sidebar';
import { BranchSidebar } from './BranchSidebar';
import { Button } from '@/components/ui/button';
import { Menu, X, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branchSidebarOpen, setBranchSidebarOpen] = useState(true);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Chat History */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-sidebar-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
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
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBranchSidebarOpen(!branchSidebarOpen)}
              className="lg:hidden"
            >
              <GitBranch className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>

          {/* Desktop header with theme toggle */}
          <div className="hidden lg:block border-b border-border p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">AI Chat</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBranchSidebarOpen(!branchSidebarOpen)}
                  className="flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  Flow History
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Chat interface with right sidebar */}
          <div className="flex-1 min-h-0 flex">
            {/* Chat Interface */}
            <div className="flex-1 min-w-0">
              <ChatInterface />
            </div>

            {/* Right Sidebar - Branch History */}
            {branchSidebarOpen && (
              <div className={cn(
                "border-l border-border bg-background transition-all duration-300 flex-shrink-0",
                "w-80 lg:w-80"
              )}>
                <BranchSidebar onClose={() => setBranchSidebarOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}