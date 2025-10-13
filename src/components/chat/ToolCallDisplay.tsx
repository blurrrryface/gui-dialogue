import React, { useState } from 'react';
import { ToolCall } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, CheckCircle, XCircle, Wrench, ChevronDown, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
  className?: string;
}

export function ToolCallDisplay({ toolCalls, className }: ToolCallDisplayProps) {
  if (!toolCalls || toolCalls.length === 0) return null;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const detectImagePaths = (result: any): string[] => {
    if (!result) return [];
    
    // If result is a string, try to parse it as JSON
    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        return detectImagePaths(parsed);
      } catch {
        // Check if it's a single path
        if (result.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          return [result];
        }
        return [];
      }
    }
    
    // If it's an array, check each item
    if (Array.isArray(result)) {
      return result.filter(item => 
        typeof item === 'string' && item.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)
      );
    }
    
    return [];
  };

  const getImageUrl = (path: string): string => {
    // Extract the relative path from the full path
    // e.g., /opt/SUPER_ML/langgraph_backend/output/... -> output/...
    const match = path.match(/output\/(.+)/);
    if (match) {
      return `${BACKEND_URL}/output/${match[1]}`;
    }
    return path;
  };

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
    <div className={cn("space-y-3 flex-1 min-w-0", className)}>
      {toolCalls.map((toolCall) => (
        <Card key={toolCall.id} className="overflow-hidden bg-card/50 border-border/50">
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Wrench className="w-4 h-4 text-chat-tool-call flex-shrink-0" />
                  <span className="font-medium text-sm text-left truncate">{toolCall.name}</span>
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
                      <div className="bg-muted/30 rounded-md p-3 overflow-hidden">
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
                      {(() => {
                        const imagePaths = detectImagePaths(toolCall.result);
                        
                        return (
                          <>
                            {imagePaths.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <ImageIcon className="w-4 h-4" />
                                  <span>{imagePaths.length} visualization{imagePaths.length > 1 ? 's' : ''} generated</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {imagePaths.map((path, idx) => {
                                    const fileName = path.split('/').pop() || `Image ${idx + 1}`;
                                    return (
                                      <div key={idx} className="space-y-2">
                                        <p className="text-xs font-medium text-foreground">{fileName}</p>
                                        <div className="border border-border rounded-md overflow-hidden bg-muted/20">
                                          <img 
                                            src={getImageUrl(path)} 
                                            alt={fileName}
                                            className="w-full h-auto"
                                            onError={(e) => {
                                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <div className="bg-chat-tool-result/10 border border-chat-tool-result/20 rounded-md p-3 min-h-[100px] overflow-hidden">
                              <pre className="text-xs text-chat-tool-result overflow-x-auto whitespace-pre-wrap break-words">
                                {typeof toolCall.result === 'string' 
                                  ? toolCall.result 
                                  : JSON.stringify(toolCall.result, null, 2)
                                }
                              </pre>
                            </div>
                          </>
                        );
                      })()}
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