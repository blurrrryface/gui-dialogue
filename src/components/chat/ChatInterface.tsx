import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Send, Loader2, User, Bot, Wifi, WifiOff, ChevronDown, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChatStore, useCurrentThread, ChatMessage, ToolCall } from '@/store/chatStore';
import { getMockResponse, simulateStreamingResponse } from '@/services/mockData';

interface ChatInterfaceProps {
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    threads, 
    currentThreadId: storeThreadId, 
    createThread, 
    addMessage, 
    updateMessage, 
    setLoading 
  } = useChatStore();
  
  const currentThread = useCurrentThread();

  useEffect(() => {
    // 如果没有当前线程，创建一个新的
    if (!storeThreadId && threads.length === 0) {
      const newThreadId = createThread();
      setCurrentThreadId(newThreadId);
    } else if (storeThreadId) {
      setCurrentThreadId(storeThreadId);
    }
  }, [storeThreadId, threads.length, createThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);

  const createThreadIfNeeded = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          graph_id: 'langgraph-app',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.thread.id || data.id || 'default';
    } catch (error) {
      console.error('Error creating thread:', error);
      return 'default';
    }
  };

  const callLangGraphAPI = async (
    message: string, 
    threadId: string, 
    messageId: string,
    onStreamUpdate: (content: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          thread_id: threadId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsBackendAvailable(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let toolCalls: ToolCall[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content' && data.content) {
                  fullContent += data.content;
                  onStreamUpdate(fullContent);
                } else if (data.type === 'tool_call' && data.toolCall) {
                  const toolCall = data.toolCall;
                  let args = {};
                  
                  // Parse args if it's a JSON string
                  if (typeof toolCall.args === 'string') {
                    try {
                      args = JSON.parse(toolCall.args);
                    } catch (e) {
                      console.error('Failed to parse tool args:', e);
                      args = { raw: toolCall.args };
                    }
                  } else {
                    args = toolCall.args || {};
                  }
                  
                  // Find existing tool call or create new one
                  const existingIndex = toolCalls.findIndex(tc => tc.id === toolCall.id);
                  const toolCallData = {
                    id: toolCall.id || `tool_${Date.now()}`,
                    name: toolCall.name || 'unknown_tool',
                    args: args,
                    result: toolCall.result,
                    status: toolCall.status || (toolCall.result ? 'completed' : 'pending')
                  };
                  
                  if (existingIndex !== -1) {
                    // Update existing tool call
                    toolCalls[existingIndex] = toolCallData;
                  } else {
                    // Add new tool call
                    toolCalls.push(toolCallData);
                  }
                  
                  // Update message with current tool calls
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      content: fullContent,
                      toolCalls: [...toolCalls]
                    });
                  }
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }
      
      // 最终更新消息
      if (currentThreadId) {
        updateMessage(currentThreadId, messageId, {
          content: fullContent || 'No response from server',
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        });
      }
    } catch (error) {
      console.error('Error calling LangGraph API:', error);
      setIsBackendAvailable(false);
      
      // Use mock data when backend is unavailable
      const mockResponse = getMockResponse(message);
      await simulateStreamingResponse(mockResponse, (content, toolCalls) => {
        if (currentThreadId) {
          updateMessage(currentThreadId, messageId, {
            content,
            toolCalls
          });
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    setInput('');
    setIsLoading(true);
    setLoading(true);

    try {
      // 确保有线程
      let threadId = currentThreadId;
      if (!threadId) {
        threadId = createThread();
        setCurrentThreadId(threadId);
      }

      // 添加用户消息
      addMessage(threadId, {
        role: 'user',
        content: trimmedInput,
      });

      // 添加初始助手消息
      addMessage(threadId, {
        role: 'assistant',
        content: '',
      });

      // 获取最新的助手消息ID
      const currentThreadState = useChatStore.getState();
      const updatedThread = currentThreadState.threads.find(t => t.id === threadId);
      const assistantMessage = updatedThread?.messages[updatedThread.messages.length - 1];
      
      if (assistantMessage) {
        // 创建后端线程ID
        const backendThreadId = await createThreadIfNeeded();
        
        // 调用API并流式更新
        await callLangGraphAPI(trimmedInput, backendThreadId, assistantMessage.id, (content) => {
          updateMessage(threadId!, assistantMessage.id, { content });
        });
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const messages = currentThread?.messages || [];

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {currentThread?.title || 'AI Chat Assistant'}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {isBackendAvailable ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  Powered by LangGraph
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  Mock Mode (Backend Unavailable)
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="text-4xl">💬</div>
                <h3 className="text-lg font-medium">How can I help you today?</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Start a conversation with your AI assistant powered by LangGraph.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-secondary">
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="max-w-3xl space-y-2">
                  {/* Tool Calls - Show first for assistant messages */}
                  {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="space-y-2">
                      {message.toolCalls.map((toolCall) => {
                        const isCompleted = toolCall.status === 'completed';
                        return (
                          <div key={toolCall.id} className="flex gap-3">
                            <Avatar className="w-8 h-8 bg-chat-tool-call/20 flex-shrink-0">
                              <AvatarFallback className="bg-chat-tool-call/20 text-chat-tool-call">
                                🔧
                              </AvatarFallback>
                            </Avatar>
                            
                            <Collapsible defaultOpen={!isCompleted} className="flex-1 min-w-0">
                              <div className="bg-chat-tool-call/10 border border-chat-tool-call/20 rounded-lg overflow-hidden">
                                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-chat-tool-call/5 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-chat-tool-call">
                                      {toolCall.name}
                                    </span>
                                    {toolCall.status === 'pending' && (
                                      <Loader2 className="w-4 h-4 animate-spin text-chat-tool-call" />
                                    )}
                                    {toolCall.status === 'completed' && (
                                      <span className="text-sm text-green-500">✓</span>
                                    )}
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform data-[state=closed]:rotate-[-90deg]" />
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="px-3 pb-3 space-y-2 border-t border-chat-tool-call/10">
                                    {toolCall.args && Object.keys(toolCall.args).length > 0 && (
                                      <div className="text-sm text-muted-foreground">
                                        <strong>Arguments:</strong>
                                        <ScrollArea className="mt-1 max-h-32">
                                          <pre className="text-sm overflow-x-auto bg-muted/30 p-2 rounded">
                                            {JSON.stringify(toolCall.args, null, 2)}
                                          </pre>
                                        </ScrollArea>
                                      </div>
                                    )}
                                    {toolCall.result && (
                                      <div className="text-sm">
                                        <strong className="text-chat-tool-result">Result:</strong>
                                        <div className="mt-1 bg-chat-tool-result/10 p-2 rounded">
                                          <ScrollArea className="max-h-48">
                                            <pre className="text-sm text-chat-tool-result overflow-x-auto">
                                              {typeof toolCall.result === 'string'
                                                ? toolCall.result
                                                : JSON.stringify(toolCall.result, null, 2)}
                                            </pre>
                                          </ScrollArea>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Message Content - Show after tool calls for assistant */}
                  {message.content && (
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm",
                        message.role === 'user'
                          ? "bg-chat-bubble-user text-chat-bubble-user-foreground ml-auto"
                          : "bg-chat-bubble-assistant text-chat-bubble-assistant-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}

                  <div
                    className={cn(
                      "text-xs text-muted-foreground",
                      message.role === 'user' ? "text-right" : "text-left"
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 bg-secondary">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-secondary rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}