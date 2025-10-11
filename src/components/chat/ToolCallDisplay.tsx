import React from 'react';
import { ToolCall } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, CheckCircle, XCircle, Wrench, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
  className?: string;
}

export function ToolCallDisplay({ toolCalls, className }: ToolCallDisplayProps) {
  if (!toolCalls || toolCalls.length === 0) return null;

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Wrench className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: ToolCall['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {toolCalls.map((toolCall) => (
        <Card key={toolCall.id} className="overflow-hidden bg-card/50 border-border/50">
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full">
                <div className="flex items-center gap-3 flex-1">
                  <Wrench className="w-4 h-4 text-chat-tool-call flex-shrink-0" />
                  <span className="font-medium text-sm text-left">{toolCall.name}</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs flex-shrink-0", getStatusColor(toolCall.status))}
                  >
                    {getStatusIcon(toolCall.status)}
                    <span className="ml-1 capitalize">{toolCall.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ChevronDown className="w-4 h-4 text-muted-foreground transform transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 border-t border-border/50">
                <div className="mt-3 space-y-3">
                  {/* Arguments */}
                  {toolCall.args && Object.keys(toolCall.args).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Arguments
                      </h4>
                      <div className="bg-muted/30 rounded-md p-3 w-full">
                        <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(toolCall.args, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {toolCall.result && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Result
                      </h4>
                      <div className="bg-chat-tool-result/10 border border-chat-tool-result/20 rounded-md p-3 w-full min-h-[100px]">
                        <pre className="text-xs text-chat-tool-result overflow-x-auto whitespace-pre-wrap break-words">
                          {typeof toolCall.result === 'string' 
                            ? toolCall.result 
                            : JSON.stringify(toolCall.result, null, 2)
                          }
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}