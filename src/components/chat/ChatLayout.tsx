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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [branchSidebarOpen, setBranchSidebarOpen] = useState(false);

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
          "fixed inset-y-0 left-0 z-50 bg-sidebar-background border-r border-border transform transition-transform duration-300 ease-in-out flex-shrink-0",
          "lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0 w-80" : "-translate-x-full lg:translate-x-0 lg:w-0",
          "lg:transition-all lg:duration-300"
        )}>
          <div className={cn(
            "h-full w-80 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:invisible"
          )}>
            <Sidebar />
          </div>
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
          <div className="border-b border-border p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  {sidebarOpen ? 'Hide' : 'Show'} Chats
                </Button>
                <h1 className="text-lg font-semibold">AI Chat</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBranchSidebarOpen(!branchSidebarOpen)}
                  className="flex items-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  {branchSidebarOpen ? 'Hide' : 'Show'} Flow
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
            <div className={cn(
              "border-l border-border bg-background transition-all duration-300 flex-shrink-0 overflow-hidden",
              branchSidebarOpen ? "w-80" : "w-0"
            )}>
              <div className={cn(
                "h-full w-80 transition-opacity duration-300",
                branchSidebarOpen ? "opacity-100" : "opacity-0 invisible"
              )}>
                <BranchSidebar onClose={() => setBranchSidebarOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}