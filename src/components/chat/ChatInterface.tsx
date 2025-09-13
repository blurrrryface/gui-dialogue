import React from 'react';
import { SimpleChat } from './SimpleChat';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  return (
    <SimpleChat className={className} />
  );
}