import React from 'react';
import { ChatMessage } from '@/store/chatStore';
import { ToolCallDisplay } from './ToolCallDisplay';
import { AgentMessageDisplay } from './AgentMessageDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
  isLatestAgent?: boolean;
}

export function MessageBubble({ message, className, isLatestAgent = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isToolCall = message.toolCalls && message.toolCalls.length > 0 && !message.content.trim();
  const isAgentMessage = message.currentAgent && message.content.trim();

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
        isToolCall ? "w-full max-w-4xl" : "max-w-3xl",
        "space-y-3",
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
        ) : isAgentMessage && message.currentAgent ? (
          /* Agent Message - 使用可折叠的组件 */
          <AgentMessageDisplay 
            agentName={message.currentAgent} 
            content={message.content}
            isLatest={isLatestAgent}
          />
        ) : (
          /* Text Content - 普通文本内容 */
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
                      // Paragraphs
                      p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                      
                      // Headings
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-bold mb-2 mt-2">{children}</h4>,
                      
                      // Code blocks
                      code: ({ children, className, ...props }) => {
                        const isInline = !className?.includes('language-');
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3 mt-2">
                          {children}
                        </pre>
                      ),
                      
                      // Lists
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      
                      // Tables
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-md border border-border">
                          <Table>
                            {children}
                          </Table>
                        </div>
                      ),
                      thead: ({ children }) => <TableHeader>{children}</TableHeader>,
                      tbody: ({ children }) => <TableBody>{children}</TableBody>,
                      tr: ({ children }) => <TableRow>{children}</TableRow>,
                      th: ({ children }) => (
                        <TableHead className="font-semibold text-foreground">
                          {children}
                        </TableHead>
                      ),
                      td: ({ children }) => <TableCell>{children}</TableCell>,
                      
                      // Blockquote
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic my-3 text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      
                      // Horizontal rule
                      hr: () => <hr className="my-4 border-border" />,
                      
                      // Links
                      a: ({ children, href }) => (
                        <a 
                          href={href} 
                          className="text-primary hover:underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      
                      // Strong/Bold
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      
                      // Emphasis/Italic
                      em: ({ children }) => <em className="italic">{children}</em>,
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