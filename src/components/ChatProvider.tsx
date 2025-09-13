"use client";

import React from "react";
import {
  useLocalRuntime,
  AssistantRuntimeProvider,
} from "@assistant-ui/react";

interface ChatProviderProps {
  children: React.ReactNode;
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Simple API call to langgraph backend
async function callLangGraphAPI(messages: readonly any[]): Promise<{ content: readonly { type: 'text'; text: string }[] }> {
  try {
    const lastMessage = messages[messages.length - 1];
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: lastMessage.content[0].text,
        thread_id: 'default',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: [{ type: 'text', text: data.content || data.message || 'No response from server' }]
    };
  } catch (error) {
    console.error('Error calling LangGraph API:', error);
    return {
      content: [{ type: 'text', text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    };
  }
}

export function ChatProvider({ children }: ChatProviderProps) {
  const runtime = useLocalRuntime({
    async run({ messages }) {
      return callLangGraphAPI(messages);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}