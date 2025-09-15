import { ToolCall } from '@/store/chatStore';

// Mock tool call examples
export const mockToolCalls: Record<string, ToolCall[]> = {
  weather: [
    {
      id: 'tool_weather_001',
      name: 'Search the internet with Serper',
      args: {
        search_query: '今天南昌天气怎样'
      },
      result: {
        searchParameters: { q: '今天南昌天气怎样', type: 'search', num: 10, engine: 'google' },
        organic: [
          {
            title: '南昌 - 中国气象局-天气预报-城市预报',
            link: 'https://weather.cma.cn/web/weather/58606.html',
            snippet: '星期六 09/13 · 35℃. 27℃ ; 星期日 09/14 · 34℃. 27℃ ; 星期一 09/15 · 35℃. 28℃',
            position: 1
          },
          {
            title: '预报- 南昌',
            link: 'https://www.weather.com.cn/weather/101240101.shtml',
            snippet: '13日（今天）. 阴. 27℃. <3级 · 14日（明天）. 雷阵雨转多云. 35℃/27℃',
            position: 2
          }
        ],
        credits: 1
      },
      status: 'completed'
    }
  ],
  
  code: [
    {
      id: 'tool_code_001',
      name: 'lov-write',
      args: {
        file_path: 'src/components/Example.tsx',
        content: 'import React from "react";\n\nconst Example = () => {\n  return <div>Hello World</div>;\n};\n\nexport default Example;'
      },
      result: 'Success.',
      status: 'completed'
    },
    {
      id: 'tool_code_002', 
      name: 'lov-line-replace',
      args: {
        file_path: 'src/App.tsx',
        search: 'const App = () => {',
        replace: 'const App: React.FC = () => {',
        first_replaced_line: 11,
        last_replaced_line: 11
      },
      result: 'Success.',
      status: 'completed'
    }
  ],

  search: [
    {
      id: 'tool_search_001',
      name: 'websearch--web_search',
      args: {
        query: 'React 18 new features',
        numResults: 5
      },
      result: {
        searchParameters: { q: 'React 18 new features', type: 'search' },
        organic: [
          {
            title: 'React 18: What\'s New and Changed',
            link: 'https://blog.logrocket.com/react-18-new-features/',
            snippet: 'React 18 introduces automatic batching, concurrent rendering, and Suspense improvements...'
          },
          {
            title: 'React v18.0 – React Blog',
            link: 'https://reactjs.org/blog/2022/03/29/react-v18.html',
            snippet: 'Today we are excited to announce the release of React 18! React 18 adds out-of-the-box performance improvements...'
          }
        ]
      },
      status: 'completed'
    }
  ],

  calculation: [
    {
      id: 'tool_calc_001',
      name: 'calculate',
      args: {
        expression: '(100 + 50) * 0.8 - 15',
        operation: 'complex_math'
      },
      result: {
        result: 105,
        steps: [
          '100 + 50 = 150',
          '150 * 0.8 = 120', 
          '120 - 15 = 105'
        ]
      },
      status: 'completed'
    }
  ],

  image: [
    {
      id: 'tool_image_001',
      name: 'imagegen--generate_image',
      args: {
        prompt: 'A beautiful sunset over mountains with golden colors, ultra high resolution',
        target_path: 'src/assets/sunset-mountains.jpg',
        width: 1024,
        height: 768,
        model: 'flux.dev'
      },
      result: 'Image successfully generated and saved to src/assets/sunset-mountains.jpg',
      status: 'completed'
    }
  ]
};

// Mock responses based on user input
export const getMockResponse = (userMessage: string): { content: string; toolCalls?: ToolCall[] } => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('天气') || message.includes('weather')) {
    return {
      content: '根据搜索结果，今天南昌的天气情况如下：\n\n今天（9月13日）：阴天，气温27°C，微风小于3级\n明天（9月14日）：雷阵雨转多云，气温范围35°C/27°C\n后天（9月15日）：多云，气温范围35°C/28°C\n\n总体来说，近期南昌天气比较温暖，有时会有雷阵雨，建议出门携带雨具。',
      toolCalls: mockToolCalls.weather
    };
  }
  
  if (message.includes('代码') || message.includes('code') || message.includes('组件') || message.includes('component')) {
    return {
      content: '我已经为您创建了一个新的React组件，并更新了相关的类型定义。组件已经添加到项目中，您可以开始使用了。',
      toolCalls: mockToolCalls.code
    };
  }
  
  if (message.includes('搜索') || message.includes('search') || message.includes('查找')) {
    return {
      content: '我为您搜索了相关信息。以下是关于React 18新特性的最新信息：\n\n主要新特性包括：\n1. 自动批处理 (Automatic Batching)\n2. 并发渲染 (Concurrent Rendering) \n3. Suspense改进\n4. 新的Hooks如useId、useDeferredValue等\n\n这些特性可以显著提升应用性能和用户体验。',
      toolCalls: mockToolCalls.search
    };
  }
  
  if (message.includes('计算') || message.includes('数学') || message.includes('算') || /\d+/.test(message)) {
    return {
      content: '我已经为您计算了结果。根据表达式 (100 + 50) * 0.8 - 15，计算步骤如下：\n\n1. 100 + 50 = 150\n2. 150 * 0.8 = 120\n3. 120 - 15 = 105\n\n最终结果是 105。',
      toolCalls: mockToolCalls.calculation
    };
  }
  
  if (message.includes('图片') || message.includes('图像') || message.includes('image') || message.includes('生成')) {
    return {
      content: '我已经为您生成了一张美丽的山景日落图片，图片已保存到项目的assets文件夹中。图片采用了高分辨率设置，具有金色的日落和壮丽的山脉景色。',
      toolCalls: mockToolCalls.image
    };
  }
  
  // Default response without tool calls
  return {
    content: `你好！我是您的AI助手。目前我正在使用模拟数据进行演示，因为后端服务暂时不可用。

您刚才说："${userMessage}"

我可以帮您处理以下类型的请求：
- 🌤️ 天气查询 (尝试问"今天天气怎么样")
- 💻 代码生成 (尝试问"帮我创建一个组件")  
- 🔍 信息搜索 (尝试问"搜索React新特性")
- 🧮 数学计算 (尝试问"帮我计算100+50")
- 🎨 图片生成 (尝试问"生成一张图片")

请注意：当前正在使用模拟数据，实际部署时会连接到真实的AI服务。`
  };
};

// Simulate streaming response
export const simulateStreamingResponse = (
  response: { content: string; toolCalls?: ToolCall[] },
  onUpdate: (content: string, toolCalls?: ToolCall[]) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let currentContent = '';
    const words = response.content.split('');
    let toolCallsEmitted = false;
    
    const streamText = () => {
      if (words.length === 0) {
        resolve();
        return;
      }
      
      // Emit tool calls first (simulate tool execution)
      if (!toolCallsEmitted && response.toolCalls) {
        onUpdate('', response.toolCalls);
        toolCallsEmitted = true;
        setTimeout(streamText, 500); // Pause for tool execution
        return;
      }
      
      currentContent += words.shift();
      onUpdate(currentContent, response.toolCalls);
      
      // Vary the delay to simulate natural typing
      const delay = Math.random() * 30 + 10;
      setTimeout(streamText, delay);
    };
    
    // Start streaming after a brief delay
    setTimeout(streamText, 300);
  });
};