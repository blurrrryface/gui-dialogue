import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiAgentDisplay, AgentMessage } from './MultiAgentDisplay';
import { Play, RotateCcw } from 'lucide-react';

// 模拟的多agent数据
const mockAgentMessages: AgentMessage[] = [
  {
    type: 'agent_start',
    content: null,
    agent_name: '研究人员',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'tool_call',
    content: null,
    agent_name: '研究人员',
    toolCall: {
      id: 'tool_1758026923145_d8e4c086a',
      name: 'Search the internet with Serper',
      args: '{"search_query": "南昌明天天气预报"}',
      result: null,
      status: 'pending'
    },
    agentCall: null,
    error: null
  },
  {
    type: 'tool_call',
    content: null,
    agent_name: '研究人员',
    toolCall: {
      id: 'tool_1758026923145_d8e4c086a',
      name: 'Search the internet with Serper',
      args: '{"search_query": "南昌明天天气预报"}',
      result: '{"searchParameters": {"q": "南昌明天天气预报", "type": "search", "num": 10, "engine": "google"}, "organic": [{"title": "预报- 南昌 - 中国天气网", "link": "https://www.weather.com.cn/weather/101240101.shtml", "snippet": "16日（今天）. 晴. 37/28℃. <3级 · 17日（明天）. 晴转多云. 36/26℃. <3级 · 18日（后天）. 多云. 33/25℃. <3级转3-4级"}]}',
      status: 'completed'
    },
    agentCall: null,
    error: null
  },
  {
    type: 'content',
    content: '明天（',
    agent_name: '研究人员',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'content',
    content: '9月17日，星期三',
    agent_name: '研究人员',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'content',
    content: '），南昌天气为晴转多云，最高气温36℃，最低气温26℃，风力小于3级。',
    agent_name: '研究人员',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'agent_call',
    content: null,
    agent_name: null,
    toolCall: null,
    agentCall: {
      from_agent: '研究人员',
      to_agent: '分析师'
    },
    error: null
  },
  {
    type: 'agent_start',
    content: null,
    agent_name: '分析师',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'content',
    content: '根据研究人员提供的天气数据，我来为您分析一下：',
    agent_name: '分析师',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'content',
    content: '1. 温度较高（36℃），属于高温天气\n2. 昼夜温差较大（10℃）\n3. 风力较小，空气流动性一般',
    agent_name: '分析师',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'agent_end',
    content: null,
    agent_name: '分析师',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'agent_end',
    content: null,
    agent_name: '研究人员',
    toolCall: null,
    agentCall: null,
    error: null
  },
  {
    type: 'complete',
    content: null,
    agent_name: null,
    toolCall: null,
    agentCall: null,
    error: null
  }
];

export function MultiAgentDemo() {
  const [displayedMessages, setDisplayedMessages] = useState<AgentMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentIndex(0);
    setDisplayedMessages([]);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setDisplayedMessages([]);
  };

  useEffect(() => {
    if (isPlaying && currentIndex < mockAgentMessages.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, mockAgentMessages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 800); // 800ms delay between messages

      return () => clearTimeout(timer);
    } else if (currentIndex >= mockAgentMessages.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">多Agent系统演示</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={startDemo}
              disabled={isPlaying}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isPlaying ? '播放中...' : '开始演示'}
            </Button>
            <Button
              onClick={resetDemo}
              variant="outline"
              size="sm" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          这个演示展示了多个AI Agent如何协作完成任务：研究人员负责搜索信息，分析师负责分析数据
        </p>
      </CardHeader>
      <CardContent>
        {displayedMessages.length > 0 ? (
          <MultiAgentDisplay 
            messages={displayedMessages}
            className="min-h-96"
          />
        ) : (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">点击"开始演示"来查看多Agent协作</p>
              <p className="text-sm">演示将展示Agent之间的转换、工具调用和内容生成过程</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}