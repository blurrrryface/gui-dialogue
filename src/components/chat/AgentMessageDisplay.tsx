import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentMessageDisplayProps {
  agentName: string;
  content: string;
  isLatest?: boolean;
  className?: string;
}

export function AgentMessageDisplay({ agentName, content, isLatest = false, className }: AgentMessageDisplayProps) {
  const [isOpen, setIsOpen] = useState(isLatest);

  return (
    <div className={cn("flex-1 min-w-0", className)}>
      <Card className="overflow-hidden bg-card/50 border-border/50">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium text-sm truncate">{agentName}</span>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  代理响应
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-border/50">
              <div className="mt-3 prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom components for better styling
                    p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                    code: ({ children, ...props }) => {
                      // Check if it's inline code by looking at the parent
                      const isInline = !props.className?.includes('language-');
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs break-all" {...props}>
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
                    li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 break-words">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2 break-words">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-1 break-words">{children}</h3>,
                    strong: ({ children }) => <strong className="font-bold break-words">{children}</strong>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}