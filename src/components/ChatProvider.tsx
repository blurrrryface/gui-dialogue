"use client";

import React, { useState, useEffect } from "react";
import {
  useExternalStoreRuntime,
  ThreadMessageLike,
  AppendMessage,
  AssistantRuntimeProvider,
} from "@assistant-ui/react";
import { useChatStore, useCurrentThread, ChatMessage } from "@/store/chatStore";

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ChatProviderProps {
  children: React.ReactNode;
}

// Convert our ChatMessage to assistant-ui format
const convertMessage = (message: ChatMessage): ThreadMessageLike => {
  return {
    id: message.id,
    role: message.role,
    content: [{ type: "text", text: message.content }],
    createdAt: new Date(message.timestamp),
    ...(message.toolCalls && {
      toolInvocations: message.toolCalls.map(toolCall => ({
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        args: toolCall.args,
        result: toolCall.result,
        state: toolCall.status === 'pending' ? 'partial-call' : 
               toolCall.status === 'completed' ? 'result' : 'error'
      }))
    })
  };
};

// API call to langgraph backend
async function callLangGraphAPI(input: string, threadId: string): Promise<ChatMessage> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input,
        thread_id: threadId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant' as const,
      content: data.content || data.message || 'No response from server',
      toolCalls: data.tool_calls?.map((tc: any) => ({
        id: tc.id || `tool_${Date.now()}`,
        name: tc.name || tc.function?.name || 'unknown_tool',
        args: tc.args || tc.function?.arguments || {},
        result: tc.result,
        status: tc.result ? 'completed' : 'pending'
      })),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error calling LangGraph API:', error);
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant' as const,
      content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now(),
    };
  }
}

export function ChatProvider({ children }: ChatProviderProps) {
  const {
    currentThreadId,
    addMessage,
    setLoading,
    isLoading,
    createThread,
  } = useChatStore();
  
  const currentThread = useCurrentThread();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Sync messages with current thread
  useEffect(() => {
    if (currentThread) {
      setMessages(currentThread.messages);
    } else {
      setMessages([]);
    }
  }, [currentThread]);

  const onNew = async (message: AppendMessage) => {
    if (message.content[0]?.type !== "text") {
      throw new Error("Only text messages are supported");
    }

    const input = message.content[0].text;
    let activeThreadId = currentThreadId;

    // Create new thread if none exists
    if (!activeThreadId) {
      activeThreadId = createThread();
    }

    // Add user message
    addMessage(activeThreadId, {
      role: "user",
      content: input,
    });
    setLoading(true);

    try {
      // Call LangGraph API
      const assistantMessage = await callLangGraphAPI(input, activeThreadId);
      addMessage(activeThreadId, assistantMessage);
    } catch (error) {
      console.error('Error in chat:', error);
      addMessage(activeThreadId, {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runtime = useExternalStoreRuntime({
    isRunning: isLoading,
    messages: messages.map(convertMessage),
    convertMessage,
    onNew,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}