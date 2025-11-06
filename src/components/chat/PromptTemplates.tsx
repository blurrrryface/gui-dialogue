import React, { useState } from 'react';
import { Code, FileCode, Sparkles, Bug, Regex, Wrench, HelpCircle, FileCheck, TestTube, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  category: string;
}

const templates: Template[] = [
  {
    id: 'code-explain',
    title: '代码理解',
    description: '精准解代码之奥秘',
    prompt: '请帮我分析和解释这段代码的功能和实现原理',
    icon: <Code className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'code-generate',
    title: '代码生成',
    description: '一键生成智能代码',
    prompt: '请帮我生成一段代码，要求：',
    icon: <FileCode className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'code-optimize',
    title: '代码优化',
    description: '提升代码执行效率',
    prompt: '请帮我优化这段代码，提升性能和可读性',
    icon: <Zap className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'debug',
    title: 'Debug',
    description: '扫尽代码隐患',
    prompt: '请帮我分析这段代码的问题并提供调试建议',
    icon: <Bug className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'regex',
    title: '正则表达式',
    description: '构建匹配文本规则',
    prompt: '请帮我编写正则表达式来匹配：',
    icon: <Regex className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'hardware',
    title: '硬件开发',
    description: '硬件百事通',
    prompt: '请帮我解答硬件开发相关的问题：',
    icon: <Wrench className="w-5 h-5" />,
    category: '硬件'
  },
  {
    id: 'consulting',
    title: '咨询解释',
    description: '行业专家更懂你',
    prompt: '请为我提供专业的技术咨询和建议：',
    icon: <HelpCircle className="w-5 h-5" />,
    category: '全部'
  },
  {
    id: 'driver',
    title: '驱动程序',
    description: '编写硬件驱动代码',
    prompt: '请帮我开发驱动程序，需求：',
    icon: <FileText className="w-5 h-5" />,
    category: '硬件'
  },
  {
    id: 'low-level',
    title: '低功耗设计',
    description: '优化硬件耗代码',
    prompt: '请帮我设计低功耗方案：',
    icon: <Sparkles className="w-5 h-5" />,
    category: '硬件'
  },
  {
    id: 'software-test',
    title: '软件测试',
    description: '软件测试百事通',
    prompt: '请帮我设计软件测试方案：',
    icon: <FileCheck className="w-5 h-5" />,
    category: '测试'
  },
  {
    id: 'hardware-test',
    title: '硬件测试',
    description: '硬件测试百事通',
    prompt: '请帮我设计硬件测试方案：',
    icon: <TestTube className="w-5 h-5" />,
    category: '测试'
  },
  {
    id: 'test-script',
    title: '测试脚本',
    description: '生成软件测试的可执行代码',
    prompt: '请帮我生成测试脚本：',
    icon: <FileText className="w-5 h-5" />,
    category: '测试'
  },
];

const categories = ['全部', '软件', '硬件', '测试', '数据库'];

interface PromptTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

export function PromptTemplates({ onSelectTemplate }: PromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const filteredTemplates = selectedCategory === '全部' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">热门智能体</h2>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 模板卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.prompt)}
            className="group relative p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left"
          >
            <div className="space-y-3">
              {/* 图标 */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {template.icon}
              </div>

              {/* 标题 */}
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </h3>

              {/* 描述 */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
