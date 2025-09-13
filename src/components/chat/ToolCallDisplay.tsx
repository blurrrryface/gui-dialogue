import React from 'react';
import { ToolCall } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Wrench } from 'lucide-react';
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
        <Card key={toolCall.id} className="p-4 bg-card/50 border-border/50">
          <div className="space-y-3">
            {/* Tool Call Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-chat-tool-call" />
                <span className="font-medium text-sm">{toolCall.name}</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getStatusColor(toolCall.status))}
              >
                {getStatusIcon(toolCall.status)}
                <span className="ml-1 capitalize">{toolCall.status}</span>
              </Badge>
            </div>

            {/* Arguments */}
            {toolCall.args && Object.keys(toolCall.args).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Arguments
                </h4>
                <div className="bg-muted/30 rounded-md p-3">
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
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
                <div className="bg-chat-tool-result/10 border border-chat-tool-result/20 rounded-md p-3">
                  <pre className="text-xs text-chat-tool-result overflow-x-auto whitespace-pre-wrap">
                    {typeof toolCall.result === 'string' 
                      ? toolCall.result 
                      : JSON.stringify(toolCall.result, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}