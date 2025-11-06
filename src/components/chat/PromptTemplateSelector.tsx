import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Calendar, 
  Users, 
  DollarSign, 
  Settings, 
  Code, 
  Database,
  Plane,
  Building,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateVariable {
  key: string;
  label: string;
  options: string[];
}

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  variables?: TemplateVariable[];
}

interface Category {
  id: string;
  label: string;
  templates: Template[];
}

const categories: Category[] = [
  {
    id: 'all',
    label: '全部',
    templates: []
  },
  {
    id: 'hr',
    label: 'HR',
    templates: [
      {
        id: 'attendance',
        title: '考勤',
        description: '出勤记录检验',
        icon: <Calendar className="w-5 h-5" />,
        prompt: '帮我查询{部门}的考勤记录',
        variables: [
          {
            key: '部门',
            label: '部门',
            options: ['技术部', '销售部', '市场部', '人力资源部', '财务部']
          }
        ]
      },
      {
        id: 'leave',
        title: '请假',
        description: '休息安排',
        icon: <Calendar className="w-5 h-5" />,
        prompt: '帮我申请{天数}天的{类型}假期',
        variables: [
          {
            key: '天数',
            label: '天数',
            options: ['1', '2', '3', '5', '7', '10']
          },
          {
            key: '类型',
            label: '假期类型',
            options: ['年假', '病假', '事假', '调休']
          }
        ]
      },
      {
        id: 'recruitment',
        title: '人事流程',
        description: '流程化办理',
        icon: <Users className="w-5 h-5" />,
        prompt: '帮我查询{流程}的办理进度',
        variables: [
          {
            key: '流程',
            label: '流程类型',
            options: ['入职', '离职', '转正', '调岗', '晋升']
          }
        ]
      }
    ]
  },
  {
    id: 'finance',
    label: '财务',
    templates: [
      {
        id: 'reimbursement',
        title: '报销提审',
        description: '快速提审指引',
        icon: <DollarSign className="w-5 h-5" />,
        prompt: '帮我提交{类型}报销，金额为{金额}元',
        variables: [
          {
            key: '类型',
            label: '报销类型',
            options: ['差旅', '餐饮', '办公用品', '交通', '其他']
          },
          {
            key: '金额',
            label: '金额',
            options: ['100', '500', '1000', '2000', '5000']
          }
        ]
      },
      {
        id: 'social-security',
        title: '社保公积金',
        description: '社会保障，安心无忧',
        icon: <Building className="w-5 h-5" />,
        prompt: '查询我的{项目}缴纳情况',
        variables: [
          {
            key: '项目',
            label: '查询项目',
            options: ['社保', '公积金', '个税', '全部']
          }
        ]
      }
    ]
  },
  {
    id: 'it',
    label: 'IT运维',
    templates: [
      {
        id: 'it-service',
        title: 'IT应用',
        description: '系统服务申请',
        icon: <Code className="w-5 h-5" />,
        prompt: '我需要{服务}的权限申请',
        variables: [
          {
            key: '服务',
            label: '服务类型',
            options: ['VPN', '代码仓库', '测试环境', '生产环境', '数据库']
          }
        ]
      },
      {
        id: 'database',
        title: '数据库',
        description: '数据查询与管理',
        icon: <Database className="w-5 h-5" />,
        prompt: '帮我查询{数据库}的{操作}',
        variables: [
          {
            key: '数据库',
            label: '数据库',
            options: ['用户数据库', '订单数据库', '产品数据库', '日志数据库']
          },
          {
            key: '操作',
            label: '操作类型',
            options: ['查询数据', '备份数据', '性能分析', '权限申请']
          }
        ]
      }
    ]
  },
  {
    id: 'travel',
    label: '差旅',
    templates: [
      {
        id: 'flight',
        title: '差旅',
        description: '高效出行',
        icon: <Plane className="w-5 h-5" />,
        prompt: '帮我预订从{出发地}到{目的地}的{交通方式}',
        variables: [
          {
            key: '出发地',
            label: '出发地',
            options: ['北京', '上海', '广州', '深圳', '杭州', '成都']
          },
          {
            key: '目的地',
            label: '目的地',
            options: ['北京', '上海', '广州', '深圳', '杭州', '成都']
          },
          {
            key: '交通方式',
            label: '交通方式',
            options: ['机票', '高铁', '酒店']
          }
        ]
      }
    ]
  }
];

// 合并所有模板到"全部"分类
categories[0].templates = categories.slice(1).flatMap(cat => cat.templates);

interface PromptTemplateSelectorProps {
  onSelectTemplate: (prompt: string) => void;
  onClose: () => void;
}

export function PromptTemplateSelector({ onSelectTemplate, onClose }: PromptTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const templates = currentCategory?.templates || [];

  const handleTemplateClick = (template: Template) => {
    if (template.variables && template.variables.length > 0) {
      // 有变量的模板，显示变量选择
      setSelectedTemplate(template);
      // 初始化变量值为第一个选项
      const initialValues: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialValues[variable.key] = variable.options[0];
      });
      setVariableValues(initialValues);
    } else {
      // 没有变量的模板，直接使用
      onSelectTemplate(template.prompt);
      onClose();
    }
  };

  const handleConfirmTemplate = () => {
    if (!selectedTemplate) return;
    
    let prompt = selectedTemplate.prompt;
    // 替换变量
    Object.entries(variableValues).forEach(([key, value]) => {
      prompt = prompt.replace(`{${key}}`, value);
    });
    
    onSelectTemplate(prompt);
    setSelectedTemplate(null);
    onClose();
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="border rounded-lg bg-background shadow-lg">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">选择模板</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2 p-4 border-b overflow-x-auto">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* 模板列表或变量选择 */}
      {selectedTemplate ? (
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50">
            {selectedTemplate.icon}
            <div className="flex-1">
              <h4 className="font-medium">{selectedTemplate.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">设置参数</h4>
            {selectedTemplate.variables?.map(variable => (
              <div key={variable.key} className="space-y-2">
                <label className="text-sm font-medium">{variable.label}</label>
                <Select
                  value={variableValues[variable.key]}
                  onValueChange={(value) => handleVariableChange(variable.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {variable.options.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="flex-1">
              返回
            </Button>
            <Button onClick={handleConfirmTemplate} className="flex-1">
              确认使用
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className={cn(
                  "flex flex-col items-start gap-2 p-4 rounded-lg border bg-card",
                  "hover:bg-accent hover:border-primary transition-colors",
                  "text-left"
                )}
              >
                <div className="text-primary">{template.icon}</div>
                <div className="space-y-1">
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
