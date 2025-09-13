# AI Chat Frontend with LangGraph Backend

一个功能完整的聊天前端应用，基于assistant-ui构建，支持与基于Python LangGraph的后端集成。

## 🚀 功能特性

### 核心功能
- ✅ **完整的聊天界面** - 现代化的聊天UI，类似ChatGPT/Claude
- ✅ **聊天记录管理** - 支持多会话，聊天历史持久化存储
- ✅ **工具调用展示** - 可视化展示AI工具调用过程和结果  
- ✅ **LangGraph集成** - 与Python LangGraph后端无缝对接
- ✅ **实时消息流** - 支持流式响应和实时更新
- ✅ **响应式设计** - 适配桌面端和移动端

### 技术特性
- 🎨 **现代设计系统** - 深色主题，蓝紫色渐变，优雅交互
- 🔧 **TypeScript** - 完整的类型安全支持
- 💾 **状态管理** - 基于Zustand的高效状态管理
- 🎯 **assistant-ui** - 使用专业的AI聊天组件库
- 📱 **移动端友好** - 响应式布局，支持触屏操作

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **UI库**: shadcn/ui + Tailwind CSS  
- **聊天组件**: assistant-ui
- **状态管理**: Zustand + 持久化
- **路由**: React Router v6
- **Markdown**: react-markdown + remark-gfm
- **图标**: Lucide React

## 📁 项目结构

```
src/
├── components/
│   ├── assistant-ui/          # assistant-ui组件封装
│   │   └── thread.tsx         # 主聊天线程组件
│   ├── chat/                  # 聊天相关组件
│   │   ├── ChatLayout.tsx     # 聊天布局容器
│   │   ├── ChatInterface.tsx  # 聊天主界面
│   │   ├── Sidebar.tsx        # 聊天历史侧边栏
│   │   ├── MessageBubble.tsx  # 消息气泡组件
│   │   └── ToolCallDisplay.tsx # 工具调用展示
│   ├── ui/                    # shadcn/ui组件
│   └── ChatProvider.tsx       # 聊天状态提供者
├── store/
│   └── chatStore.ts           # Zustand状态管理
├── styles/
│   └── assistant-ui.css       # assistant-ui样式覆盖
├── pages/
│   ├── Index.tsx              # 主页面
│   └── NotFound.tsx           # 404页面
└── lib/
    └── utils.ts               # 工具函数
```

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18
- npm >= 9

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env` 文件：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:8080 运行

## 🔧 后端集成

### API接口约定

前端期望后端提供以下API接口：

#### POST /chat
发送聊天消息

**请求体:**
```json
{
  "message": "用户消息内容",
  "thread_id": "会话ID"
}
```

**响应体:**
```json
{
  "content": "AI回复内容",
  "tool_calls": [
    {
      "id": "tool_call_id",
      "name": "tool_name",
      "args": {"param": "value"},
      "result": "工具执行结果",
      "status": "completed" // pending | completed | error
    }
  ]
}
```

### LangGraph后端示例

```python
from fastapi import FastAPI
from pydantic import BaseModel
from langgraph import StateGraph
import uvicorn

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    thread_id: str

class ToolCall(BaseModel):
    id: str
    name: str
    args: dict
    result: str = None
    status: str = "completed"

class ChatResponse(BaseModel):
    content: str
    tool_calls: list[ToolCall] = []

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 在这里集成你的LangGraph逻辑
    # graph = create_your_langgraph()
    # result = await graph.ainvoke({"input": request.message})
    
    return ChatResponse(
        content="这是AI的回复",
        tool_calls=[
            ToolCall(
                id="tool_1",
                name="search_web",
                args={"query": "搜索内容"},
                result="搜索结果",
                status="completed"
            )
        ]
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🎨 自定义样式

### 主题色彩
在 `src/index.css` 中自定义主题：

```css
:root {
  /* 主品牌色 */
  --primary: 240 100% 70%;
  --primary-glow: 260 100% 75%;
  
  /* 聊天气泡颜色 */
  --chat-bubble-user: 240 100% 70%;
  --chat-bubble-assistant: 220 14% 15%;
  
  /* 工具调用颜色 */
  --chat-tool-call: 260 100% 75%;
  --chat-tool-result: 150 60% 50%;
}
```

### 组件样式
在 `src/styles/assistant-ui.css` 中覆盖assistant-ui默认样式

## 📱 功能详解

### 聊天记录管理
- 自动创建新会话
- 会话标题自动生成（基于首条消息）
- 支持删除会话
- 本地存储持久化

### 工具调用展示
- 可视化工具调用过程
- 显示调用参数和结果
- 支持错误状态展示
- 语法高亮的JSON显示

### 消息渲染
- Markdown支持（代码块、列表、链接等）
- 代码语法高亮
- 响应式消息气泡
- 时间戳显示

## 🔍 开发说明

### 状态管理
使用Zustand管理聊天状态：
- `threads`: 所有聊天会话
- `currentThreadId`: 当前活跃会话
- `isLoading`: 加载状态

### 消息流程
1. 用户输入消息 → assistant-ui捕获
2. ChatProvider处理 → 调用后端API
3. 更新Zustand状态 → UI自动响应
4. 本地存储持久化

### 扩展开发
- 添加新的工具调用类型：扩展 `ToolCallDisplay` 组件
- 自定义消息渲染：修改 `MessageBubble` 组件
- 新增聊天功能：扩展 `ChatProvider` 和状态管理

## 🚀 部署

### 构建生产版本
```bash
npm run build
```

### 使用Lovable部署
1. 点击右上角"Publish"按钮
2. 配置自定义域名（可选）
3. 应用自动部署到CDN

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

基于 [assistant-ui](https://www.assistant-ui.com/) 构建 | 由 [Lovable](https://lovable.dev) 开发平台支持