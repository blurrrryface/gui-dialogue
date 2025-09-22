import React from 'react';
import { ChatMessage } from '@/store/chatStore';
import { ToolCallDisplay } from './ToolCallDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isToolCall = message.toolCalls && message.toolCalls.length > 0 && !message.content.trim();

  return (
    <div className={cn(
      "flex gap-4 p-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      {/* Avatar */}
      {!isUser && (
        <Avatar className="w-8 h-8 bg-secondary">
          <AvatarFallback>
            {isToolCall ? <Wrench className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-3xl space-y-3",
        isUser ? "order-first" : ""
      )}>
        {/* Current Agent Indicator */}
        {isAssistant && message.currentAgent && (
          <div className="mb-2 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium inline-block">
            {message.currentAgent}
          </div>
        )}
        
        {/* Tool Call Indicator */}
        {isToolCall && (
          <div className="mb-2 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-medium inline-block">
            工具调用
          </div>
        )}

        {/* Tool Calls - 优先显示工具调用 */}
        {message.toolCalls && message.toolCalls.length > 0 ? (
          <ToolCallDisplay toolCalls={message.toolCalls} />
        ) : (
          /* Text Content - 只在没有工具调用时显示文本内容 */
          message.content.trim() && (
            <div className={cn(
              "rounded-2xl px-4 py-3 text-sm",
              isUser 
                ? "bg-chat-bubble-user text-chat-bubble-user-foreground ml-auto" 
                : "bg-chat-bubble-assistant text-chat-bubble-assistant-foreground"
            )}>
              {isAssistant ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom components for better styling
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      code: ({ children, ...props }) => {
                        // Check if it's inline code by looking at the parent
                        const isInline = !props.className?.includes('language-');
                        return isInline ? (
                          <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          )
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-muted-foreground",
          isUser ? "text-right" : "text-left"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-8 h-8 bg-primary">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}