import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Wrench,
  Users,
  Play,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentMessage {
  type: 'agent_start' | 'agent_end' | 'tool_call' | 'agent_call' | 'content' | 'complete';
  content?: string;
  agent_name?: string;
  toolCall?: {
    id: string;
    name: string;
    args: string;
    result?: string;
    status: 'pending' | 'completed' | 'error';
  };
  agentCall?: {
    from_agent: string;
    to_agent: string;
  };
  error?: string;
}

interface MultiAgentDisplayProps {
  messages: AgentMessage[];
  className?: string;
}

const getAgentColor = (agentName: string) => {
  const colors = [
    'bg-blue-100 text-blue-900 border-blue-200',
    'bg-green-100 text-green-900 border-green-200', 
    'bg-purple-100 text-purple-900 border-purple-200',
    'bg-orange-100 text-orange-900 border-orange-200',
    'bg-pink-100 text-pink-900 border-pink-200'
  ];
  
  const hash = agentName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

const AgentTransition: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full border">
      <Badge variant="outline" className={getAgentColor(from)}>
        <Bot className="w-3 h-3 mr-1" />
        {from}
      </Badge>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
      <Badge variant="outline" className={getAgentColor(to)}>
        <Bot className="w-3 h-3 mr-1" />
        {to}
      </Badge>
    </div>
  </div>
);

const ToolCallCard: React.FC<{ toolCall: AgentMessage['toolCall']; agentName: string }> = ({ 
  toolCall, 
  agentName 
}) => {
  if (!toolCall) return null;
  
  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-900 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-900 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-900 border-red-200';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-200';
    }
  };

  return (
    <Card className="mb-2 mx-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            {toolCall.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getAgentColor(agentName)}>
              {agentName}
            </Badge>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()}
              {toolCall.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {toolCall.args && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground font-medium mb-1">参数:</p>
            <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
              {JSON.stringify(JSON.parse(toolCall.args), null, 2)}
            </pre>
          </div>
        )}
        {toolCall.result && (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">结果:</p>
            <pre className="text-xs bg-muted rounded p-2 overflow-x-auto max-h-32">
              {typeof toolCall.result === 'string' 
                ? toolCall.result 
                : JSON.stringify(toolCall.result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AgentSection: React.FC<{ 
  agentName: string; 
  isActive: boolean;
  isStarting: boolean;
  isEnding: boolean;
  content: string[];
  toolCalls: AgentMessage['toolCall'][];
}> = ({ agentName, isActive, isStarting, isEnding, content, toolCalls }) => (
  <div className={cn(
    "border rounded-lg mb-4 transition-all duration-300",
    isActive ? "border-primary shadow-md" : "border-border"
  )}>
    <div className={cn(
      "flex items-center gap-3 p-4 border-b",
      isActive ? "bg-primary/5" : "bg-muted/30"
    )}>
      <div className="flex items-center gap-2">
        {isActive ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
        <Badge variant="outline" className={getAgentColor(agentName)}>
          <Bot className="w-3 h-3 mr-1" />
          {agentName}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        {isStarting && (
          <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200">
            <Play className="w-3 h-3 mr-1" />
            开始
          </Badge>
        )}
        {isEnding && (
          <Badge variant="outline" className="bg-gray-100 text-gray-900 border-gray-200">
            <Square className="w-3 h-3 mr-1" />
            结束
          </Badge>
        )}
      </div>
    </div>
    
    <div className="p-4">
      {toolCalls.map((toolCall, index) => (
        <ToolCallCard key={`${toolCall?.id}-${index}`} toolCall={toolCall} agentName={agentName} />
      ))}
      
      {content.length > 0 && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-background border rounded-lg p-3">
            {content.map((text, index) => (
              <span key={index}>{text}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export function MultiAgentDisplay({ messages, className }: MultiAgentDisplayProps) {
  // 处理消息，按agent分组
  const processMessages = () => {
    const agentSections: {[key: string]: {
      isActive: boolean;
      isStarting: boolean;
      isEnding: boolean;
      content: string[];
      toolCalls: AgentMessage['toolCall'][];
    }} = {};
    
    const agentTransitions: {from: string; to: string}[] = [];
    let currentAgent = '';
    
    messages.forEach((message) => {
      const agentName = message.agent_name?.trim() || '';
      
      if (message.type === 'agent_start') {
        currentAgent = agentName;
        if (!agentSections[agentName]) {
          agentSections[agentName] = {
            isActive: false,
            isStarting: false,
            isEnding: false,
            content: [],
            toolCalls: []
          };
        }
        agentSections[agentName].isStarting = true;
        agentSections[agentName].isActive = true;
      }
      
      if (message.type === 'agent_end') {
        if (agentSections[agentName]) {
          agentSections[agentName].isEnding = true;
          agentSections[agentName].isActive = false;
        }
      }
      
      if (message.type === 'content' && message.content && agentName) {
        if (!agentSections[agentName]) {
          agentSections[agentName] = {
            isActive: true,
            isStarting: false,
            isEnding: false,
            content: [],
            toolCalls: []
          };
        }
        agentSections[agentName].content.push(message.content);
      }
      
      if (message.type === 'tool_call' && message.toolCall && agentName) {
        if (!agentSections[agentName]) {
          agentSections[agentName] = {
            isActive: false,
            isStarting: false,
            isEnding: false,
            content: [],
            toolCalls: []
          };
        }
        agentSections[agentName].toolCalls.push(message.toolCall);
      }
      
      if (message.type === 'agent_call' && message.agentCall) {
        agentTransitions.push({
          from: message.agentCall.from_agent,
          to: message.agentCall.to_agent
        });
      }
    });
    
    return { agentSections, agentTransitions };
  };

  const { agentSections, agentTransitions } = processMessages();
  const isComplete = messages.some(m => m.type === 'complete');

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">多Agent协作</h3>
        {isComplete && (
          <Badge variant="outline" className="bg-green-100 text-green-900 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            完成
          </Badge>
        )}
      </div>
      
      {Object.entries(agentSections).map(([agentName, section]) => (
        <AgentSection
          key={agentName}
          agentName={agentName}
          isActive={section.isActive}
          isStarting={section.isStarting}
          isEnding={section.isEnding}
          content={section.content}
          toolCalls={section.toolCalls}
        />
      ))}
      
      {agentTransitions.map((transition, index) => (
        <AgentTransition
          key={index}
          from={transition.from}
          to={transition.to}
        />
      ))}
    </div>
  );
}