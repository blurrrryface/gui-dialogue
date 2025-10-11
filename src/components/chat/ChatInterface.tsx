import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Send, Loader2, User, Bot, Wifi, WifiOff, ChevronDown, ChevronRight, Paperclip, X, FileText, Image } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChatStore, useCurrentThread, ChatMessage, ToolCall, AgentCall, FileAttachment, AgentBlock } from '@/store/chatStore';
import { getMockResponse, simulateStreamingResponse } from '@/services/mockData';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    threads, 
    currentThreadId: storeThreadId, 
    graphId,
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

  // 文件处理函数
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = Array.from(files).map((file, index) => ({
      id: `attachment_${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // 清空文件输入
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // 上传文件到服务器
  const uploadFileToServer = async (file: File, threadId: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('thread_id', threadId);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data.url; // 假设服务器返回文件URL
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
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
          graph_id: graphId,
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
      let buffer = ''; // Buffer for incomplete lines
      let currentAgent = '';
      let agentBlocks: AgentBlock[] = [];
      let currentAgentIndex = -1;
      let hasContentInCurrentAgent = false;
      let eventTimestamp = 0; // 用于记录事件发生的顺序

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Split by newlines and keep the last incomplete line in buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '') continue; // Skip empty data lines
                
                const data = JSON.parse(jsonStr);
                console.log('Parsed stream data:', data.type, data.agent_name || '', data.toolCall?.status || data.agentCall || '');
                eventTimestamp++; // 每个事件递增时间戳
                
                if (data.type === 'agent_start' && data.agent_name) {
                  const agentName = data.agent_name.trim();
                  currentAgent = agentName;
                  hasContentInCurrentAgent = false;
                  console.log('Agent started:', currentAgent);
                } else if (data.type === 'agent_end' && data.agent_name) {
                  const endingAgent = data.agent_name.trim();
                  console.log('Agent ended:', endingAgent);
                } else if (data.type === 'content' && data.content) {
                  // 检查 agent 名称是否变化（在有内容输出的情况下）
                  const streamAgentName = data.agent_name ? data.agent_name.trim() : '';
                  
                  // 如果有明确的agent名称，且与当前agent不同，立即切换
                  if (streamAgentName && streamAgentName !== currentAgent) {
                    console.log('Agent changed during content stream from:', currentAgent, 'to:', streamAgentName);
                    currentAgent = streamAgentName;
                    currentAgentIndex = -1; // 重置索引，强制创建新块
                    hasContentInCurrentAgent = false;
                  }
                  
                  if (currentAgent) {
                    // 标记当前 agent 有内容输出
                    hasContentInCurrentAgent = true;
                    
                    // 找到或创建当前 agent 的块
                    if (currentAgentIndex === -1) {
                      // 总是创建新的 agent 块（不重用之前的块）
                      agentBlocks.push({
                        agentName: currentAgent,
                        content: '',
                        timestamp: eventTimestamp
                      });
                      currentAgentIndex = agentBlocks.length - 1;
                      console.log('Created new agent block for:', currentAgent, 'index:', currentAgentIndex);
                    }
                    
                    // 添加内容到当前 agent 块
                    agentBlocks[currentAgentIndex].content += data.content;
                    
                    // 构建完整内容用于显示（仅用于备用显示）
                    fullContent = agentBlocks.map(block => block.content).join('\n\n');
                  } else {
                    // 没有 agent 上下文的回退处理
                    fullContent += data.content;
                  }
                  
                  // 更新消息，包含 agent 块信息
                  if (currentThreadId) {
                    updateMessage(currentThreadId, messageId, {
                      content: fullContent,
                      toolCalls: [...toolCalls],
                      agentBlocks: [...agentBlocks],
                      currentAgent: currentAgent
                    });
                  }
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
                    status: toolCall.status || (toolCall.result ? 'completed' : 'pending'),
                    timestamp: eventTimestamp
                  };
                  
                  console.log('Tool call update:', toolCallData.name, toolCallData.status, 
                    toolCallData.result ? `result length: ${JSON.stringify(toolCallData.result).length}` : 'no result');
                  
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
                      toolCalls: [...toolCalls],
                      agentBlocks: [...agentBlocks],
                      currentAgent: currentAgent
                    });
                  }
                } else if (data.type === 'agent_call' && data.agentCall) {
                  // Handle agent transitions
                  const agentCall = {
                    id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    from_agent: data.agentCall.from_agent || 'unknown',
                    to_agent: data.agentCall.to_agent || 'unknown',
                    timestamp: Date.now()
                  };
                  
                  console.log('Agent transition:', agentCall.from_agent, '→', agentCall.to_agent);
                  
                  // Update message with agent calls and current agent
                  if (currentThreadId) {
                    const currentState = useChatStore.getState();
                    const thread = currentState.threads.find(t => t.id === currentThreadId);
                    const message = thread?.messages.find(m => m.id === messageId);
                    const existingAgentCalls = message?.agentCalls || [];
                    
                    updateMessage(currentThreadId, messageId, {
                      content: fullContent,
                      toolCalls: [...toolCalls],
                      agentCalls: [...existingAgentCalls, agentCall],
                      agentBlocks: [...agentBlocks],
                      currentAgent: agentCall.to_agent
                    });
                  }
                }
              } catch (e) {
                console.error('JSON parse error:', e, 'Line:', line.slice(0, 200) + '...');
              }
            }
          }
        }
        
        // Process any remaining data in buffer
        if (buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.slice(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              console.log('Final buffer data:', data.type);
              // Process final data if needed
            }
          } catch (e) {
            console.error('Final buffer parse error:', e);
          }
        }
      }
      
      // 最终更新消息
      if (currentThreadId) {
        updateMessage(currentThreadId, messageId, {
          content: fullContent || 'No response from server',
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          agentBlocks: agentBlocks.length > 0 ? agentBlocks : undefined,
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
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

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

      // 上传文件到服务器
      const uploadedAttachments: FileAttachment[] = [];
      for (const attachment of attachments) {
        if (attachment.file) {
          try {
            const url = await uploadFileToServer(attachment.file, threadId);
            uploadedAttachments.push({
              ...attachment,
              url: url,
              file: undefined // 清除本地文件引用
            });
          } catch (error) {
            console.error('Error uploading file:', attachment.name, error);
            // 如果上传失败，仍然保留本地文件
            uploadedAttachments.push(attachment);
          }
        } else {
          uploadedAttachments.push(attachment);
        }
      }

      // 添加用户消息（包含附件）
      addMessage(threadId, {
        role: 'user',
        content: trimmedInput,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      });

      // 清空附件
      setAttachments([]);

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

  // 文件附件组件
  const FileAttachmentItem = ({ attachment, showRemoveButton = false }: { 
    attachment: FileAttachment; 
    showRemoveButton?: boolean; 
  }) => {
    const isImage = attachment.type.startsWith('image/');
    const fileSize = (attachment.size / 1024).toFixed(1) + ' KB';

    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg relative group">
        {showRemoveButton && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(attachment.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        
        <div className="flex-shrink-0">
          {isImage ? (
            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">{fileSize}</p>
        </div>
        
        {attachment.url && !showRemoveButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(attachment.url, '_blank')}
            className="flex-shrink-0"
          >
            下载
          </Button>
        )}
      </div>
    );
  };

  const messages = currentThread?.messages || [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        <div className="space-y-4 pb-4">
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
            messages.map((message) => {
              // 如果是助手消息且有 agent 块或工具调用，需要按时间戳顺序渲染
              if (message.role === 'assistant' && (message.agentBlocks?.length || message.toolCalls?.length)) {
                const messageItems = [];
                
                // 创建一个包含所有内容的数组，按时间戳排序
                const allItems: Array<{
                  type: 'agent' | 'tool';
                  data: any;
                  timestamp: number;
                }> = [];
                
                // 添加 agent 块
                if (message.agentBlocks) {
                  message.agentBlocks.forEach((agentBlock) => {
                    allItems.push({
                      type: 'agent',
                      data: agentBlock,
                      timestamp: agentBlock.timestamp || 0
                    });
                  });
                }
                
                // 添加工具调用
                if (message.toolCalls) {
                  message.toolCalls.forEach((toolCall) => {
                    allItems.push({
                      type: 'tool',
                      data: toolCall,
                      timestamp: toolCall.timestamp || 0
                    });
                  });
                }
                
                // 按时间戳排序
                allItems.sort((a, b) => a.timestamp - b.timestamp);
                
                // 渲染所有项目
                allItems.forEach((item, itemIndex) => {
                  if (item.type === 'agent') {
                    const isLastAgent = itemIndex === allItems.length - 1 || 
                      (itemIndex === allItems.length - 2 && allItems[allItems.length - 1].type === 'tool');
                    
                    const agentMessage: ChatMessage = {
                      ...message,
                      id: `${message.id}_agent_${itemIndex}`,
                      content: item.data.content,
                      currentAgent: item.data.agentName,
                      agentBlocks: undefined,
                      toolCalls: undefined,
                    };
                    
                    messageItems.push(
                      <MessageBubble 
                        key={agentMessage.id} 
                        message={agentMessage}
                        isLatestAgent={isLastAgent}
                      />
                    );
                  } else if (item.type === 'tool') {
                    const toolMessage: ChatMessage = {
                      ...message,
                      id: `${message.id}_tool_${itemIndex}`,
                      content: '',
                      agentBlocks: undefined,
                      toolCalls: [item.data],
                      currentAgent: undefined,
                    };
                    
                    messageItems.push(
                      <MessageBubble 
                        key={toolMessage.id} 
                        message={toolMessage} 
                      />
                    );
                  }
                });
                
                return messageItems;
              } else {
                // 普通消息的正常渲染
                return (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                  />
                );
              }
            }).flat()
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
      <div className="border-t border-border p-4 flex-shrink-0">
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              附件 ({attachments.length})
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {attachments.map((attachment) => (
                <FileAttachmentItem 
                  key={attachment.id} 
                  attachment={attachment} 
                  showRemoveButton={true} 
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {/* 文件上传按钮 */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-32 resize-none flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="w-12 h-12 bg-primary hover:bg-primary/90 flex-shrink-0"
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
    </div>
  );
}
