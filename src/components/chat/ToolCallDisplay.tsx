import React from 'react';
import { ToolCall } from '@/store/chatStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const renderJSONAsTable = (data: any) => {
    if (Array.isArray(data)) {
      // JSON array - render as multi-row table
      if (data.length === 0) return <div className="text-xs text-muted-foreground p-4">Empty array</div>;
      
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Array of objects - use object keys as headers
        const headers = Object.keys(firstItem);
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="text-xs font-medium px-3 py-2 bg-muted/50 whitespace-nowrap">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  {headers.map((header) => (
                    <TableCell key={header} className="text-xs px-3 py-2 max-w-xs">
                      <div className="truncate" title={String(item[header] || '')}>
                        {typeof item[header] === 'object' 
                          ? JSON.stringify(item[header]) 
                          : String(item[header] || '')
                        }
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      } else {
        // Array of primitives - render as single column
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium px-3 py-2 bg-muted/50">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  <TableCell className="text-xs px-3 py-2">
                    <div className="break-words">{String(item)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
    } else if (typeof data === 'object' && data !== null) {
      // JSON object - render as key-value table
      const entries = Object.entries(data);
      
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium px-3 py-2 bg-muted/50 w-32">Key</TableHead>
              <TableHead className="text-xs font-medium px-3 py-2 bg-muted/50">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key} className="hover:bg-muted/20">
                <TableCell className="text-xs font-medium px-3 py-2 w-32 align-top">
                  <div className="break-words">{key}</div>
                </TableCell>
                <TableCell className="text-xs px-3 py-2">
                  <div className="break-words max-w-2xl">
                    {typeof value === 'object' 
                      ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
                      : String(value)
                    }
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    
    return null;
  };

  const renderResult = (result: any) => {
    let parsedData;
    let shouldRenderAsTable = false;

    // Handle different result types
    if (typeof result === 'object' && result !== null) {
      // Result is already an object
      parsedData = result;
      shouldRenderAsTable = true;
    } else if (typeof result === 'string') {
      // Result is a string, try to parse as JSON
      if (isValidJSON(result)) {
        try {
          parsedData = JSON.parse(result);
          shouldRenderAsTable = true;
        } catch {
          shouldRenderAsTable = false;
        }
      }
    }

    if (shouldRenderAsTable && parsedData) {
      const tableComponent = renderJSONAsTable(parsedData);
      
      if (tableComponent) {
        return (
          <div className="bg-chat-tool-result/10 border border-chat-tool-result/20 rounded-md overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto">
              {tableComponent}
            </div>
          </div>
        );
      }
    }
    
    // Fallback to original pre display
    const resultString = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    return (
      <div className="bg-chat-tool-result/10 border border-chat-tool-result/20 rounded-md p-3 w-full min-h-[100px]">
        <pre className="text-xs text-chat-tool-result overflow-x-auto whitespace-pre-wrap break-words">
          {resultString}
        </pre>
      </div>
    );
  };

  return (
    <div className={cn("space-y-3 w-full", className)}>
      {toolCalls.map((toolCall) => (
        <Card key={toolCall.id} className="overflow-hidden bg-card/50 border-border/50 w-full max-w-4xl">
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
                      {renderResult(toolCall.result)}
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