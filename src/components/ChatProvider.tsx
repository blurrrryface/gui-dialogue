import React from 'react';

interface ChatProviderProps {
  children: React.ReactNode;
}

// Simple provider that just passes through children without assistant-ui
export function ChatProvider({ children }: ChatProviderProps) {
  return <>{children}</>;
}