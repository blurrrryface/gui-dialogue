import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Circle, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface BranchNode {
  id: string;
  type: 'message' | 'tool_call' | 'branch' | 'merge';
  title: string;
  content?: string;
  status: 'pending' | 'completed' | 'error' | 'active';
  timestamp: number;
  children?: string[];
  parent?: string;
  branchName?: string;
}

// Mock data for demonstration
const mockNodes: BranchNode[] = [
  {
    id: 'root',
    type: 'message',
    title: 'Initial Question',
    content: '你好，我想了解React的useState',
    status: 'completed',
    timestamp: Date.now() - 120000,
    children: ['response-1']
  },
  {
    id: 'response-1',
    type: 'message', 
    title: 'AI Response',
    content: 'useState是React的一个Hook...',
    status: 'completed',
    timestamp: Date.now() - 100000,
    parent: 'root',
    children: ['tool-1', 'branch-1']
  },
  {
    id: 'tool-1',
    type: 'tool_call',
    title: 'Code Search',
    content: 'search_code("useState examples")',
    status: 'completed',
    timestamp: Date.now() - 80000,
    parent: 'response-1',
    children: ['merge-1']
  },
  {
    id: 'branch-1',
    type: 'branch',
    title: 'Alternative Path',
    branchName: 'detailed-explanation',
    status: 'active',
    timestamp: Date.now() - 60000,
    parent: 'response-1',
    children: ['response-2']
  },
  {
    id: 'response-2',
    type: 'message',
    title: 'Detailed Response',
    content: '让我详细解释useState的工作原理...',
    status: 'pending',
    timestamp: Date.now() - 40000,
    parent: 'branch-1'
  },
  {
    id: 'merge-1',
    type: 'merge',
    title: 'Merge Results',
    status: 'completed',
    timestamp: Date.now() - 20000,
    parent: 'tool-1'
  }
];

interface BranchSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function BranchSidebar({ className, onClose }: BranchSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main-flow']);
  const [selectedNode, setSelectedNode] = useState<string | null>('response-1');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getNodeIcon = (node: BranchNode) => {
    switch (node.type) {
      case 'message':
        return <Circle className="w-3 h-3" />;
      case 'tool_call':
        return <GitCommit className="w-3 h-3" />;
      case 'branch':
        return <GitBranch className="w-3 h-3" />;
      case 'merge':
        return <GitMerge className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const getStatusIcon = (status: BranchNode['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'active':
        return <Clock className="w-3 h-3 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", className)}>
      {/* Header */}
      <div className="border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Flow History</h2>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {!collapsed && (
          <div className="mt-3 flex gap-2 animate-fade-in">
            <Badge variant="secondary" className="text-xs">
              Main Branch
            </Badge>
            <Badge variant="outline" className="text-xs">
              5 nodes
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {!collapsed ? (
          <ScrollArea className="h-full px-2">
            <div className="space-y-4 py-4">
              {/* Current Flow */}
              <div className="animate-fade-in">
                <div 
                  className="flex items-center gap-2 cursor-pointer py-1 hover:bg-muted/50 rounded px-2 transition-colors"
                  onClick={() => toggleGroup('main-flow')}
                >
                  {expandedGroups.includes('main-flow') ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Current Flow</span>
                </div>
                
                {expandedGroups.includes('main-flow') && (
                  <div className="mt-2 animate-fade-in">
                    <div className="space-y-2 pl-2">
                      {mockNodes.map((node, index) => (
                        <div key={node.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          {/* Connection line */}
                          {index > 0 && (
                            <div className="absolute left-4 -top-2 w-px h-4 bg-gradient-to-b from-border to-transparent" />
                          )}
                          
                          <div 
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group relative hover-scale",
                              selectedNode === node.id 
                                ? "bg-accent border border-accent-foreground/20 shadow-sm scale-[1.02]" 
                                : "hover:bg-muted/50 hover:shadow-sm",
                              node.type === 'branch' && "ml-4 border-l-2 border-primary bg-primary/5"
                            )}
                            onClick={() => setSelectedNode(node.id)}
                          >
                            {/* Node icon */}
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                              node.status === 'active' && "border-primary bg-primary/10 animate-pulse",
                              node.status === 'completed' && "border-green-500 bg-green-50 dark:bg-green-950",
                              node.status === 'error' && "border-red-500 bg-red-50 dark:bg-red-950",
                              node.status === 'pending' && "border-blue-500 bg-blue-50 dark:bg-blue-950",
                              selectedNode === node.id && "scale-110"
                            )}>
                              {getNodeIcon(node)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {node.title}
                                </span>
                                {getStatusIcon(node.status)}
                              </div>
                              
                              {node.content && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {node.content}
                                </p>
                              )}
                              
                              {node.branchName && (
                                <Badge variant="outline" className="text-xs mt-1 hover-scale">
                                  {node.branchName}
                                </Badge>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(node.timestamp)}
                                </span>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Branch Actions */}
              <div className="animate-fade-in">
                <span className="text-sm font-medium text-muted-foreground px-2">Actions</span>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start hover-scale">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Create Branch
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover-scale">
                    <GitMerge className="w-4 h-4 mr-2" />
                    Merge Branch  
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover-scale">
                    <Clock className="w-4 h-4 mr-2" />
                    Rollback to Node
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          // Collapsed view - show only icons
          <div className="flex flex-col items-center gap-3 p-2 animate-fade-in">
            {mockNodes.slice(0, 3).map((node, index) => (
              <div 
                key={node.id}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover-scale",
                  selectedNode === node.id && "border-primary bg-primary/10 scale-110",
                  node.status === 'completed' && "border-green-500",
                  node.status === 'error' && "border-red-500",
                  node.status === 'pending' && "border-blue-500"
                )}
                onClick={() => setSelectedNode(node.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {getNodeIcon(node)}
              </div>
            ))}
            <div className="text-xs text-muted-foreground">+{mockNodes.length - 3}</div>
          </div>
        )}
      </div>
    </div>
  );
}