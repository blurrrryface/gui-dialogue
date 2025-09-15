# 后端文件上传对接指南

## 概述
前端已经实现了文件上传功能，需要后端提供两个主要API端点来支持文件上传和聊天功能。

## 需要实现的API端点

### 1. 文件上传端点

**URL:** `POST /upload`
**Content-Type:** `multipart/form-data`

#### 请求格式
```
POST /upload
Content-Type: multipart/form-data

Body:
- file: File对象
```

#### 响应格式
```json
{
  "success": true,
  "url": "https://your-domain.com/files/uploaded-file-name.ext",
  "filename": "uploaded-file-name.ext",
  "size": 1024,
  "type": "image/png"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "File upload failed",
  "message": "File size exceeds limit"
}
```

#### Python FastAPI 示例实现

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import aiofiles
import os
import uuid
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.txt', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.doc', '.docx'}

# 确保上传目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 验证文件大小
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File size exceeds limit")
        
        # 验证文件类型
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=415, detail="File type not allowed")
        
        # 生成唯一文件名
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # 保存文件
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # 返回文件URL
        file_url = f"https://your-domain.com/files/{unique_filename}"
        
        return JSONResponse({
            "success": True,
            "url": file_url,
            "filename": unique_filename,
            "size": len(content),
            "type": file.content_type
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 文件下载端点
@app.get("/files/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)
```

### 2. 聊天消息端点（更新）

**URL:** `POST /threads/{thread_id}/messages`

#### 请求格式
```json
{
  "message": "用户输入的文本",
  "thread_id": "thread_123",
  "stream": true,
  "attachments": [
    {
      "id": "attachment_123",
      "name": "document.pdf",
      "url": "https://your-domain.com/files/document.pdf",
      "type": "application/pdf",
      "size": 1024
    }
  ]
}
```

#### 响应格式（流式）
```
data: {"content": "AI的", "type": "content"}
data: {"content": "回复", "type": "content"}
data: {"content": "内容", "type": "content"}
data: [DONE]
```

#### Python FastAPI 示例实现

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import asyncio

@app.post("/threads/{thread_id}/messages")
async def send_message(thread_id: str, request: dict):
    message = request.get("message", "")
    attachments = request.get("attachments", [])
    
    async def generate_response():
        # 处理附件
        attachment_context = ""
        if attachments:
            attachment_context = f"用户上传了 {len(attachments)} 个文件：\n"
            for att in attachments:
                attachment_context += f"- {att['name']} ({att['type']})\n"
        
        # 结合消息和附件生成AI回复
        full_context = f"{attachment_context}\n用户消息：{message}"
        
        # 这里调用你的AI模型
        ai_response = await call_ai_model(full_context, thread_id)
        
        # 流式返回结果
        for chunk in ai_response:
            yield f"data: {json.dumps({'content': chunk, 'type': 'content'})}\n\n"
            await asyncio.sleep(0.05)  # 模拟流式输出
        
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_response(), 
        media_type="text/event-stream"
    )

async def call_ai_model(message: str, thread_id: str):
    # 这里是你的AI模型调用逻辑
    # 可以是OpenAI、Claude、或者本地模型
    pass
```

### 3. Node.js Express 示例实现

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// 文件上传端点
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = `https://your-domain.com/files/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 聊天消息端点
app.post('/threads/:threadId/messages', express.json(), async (req, res) => {
  const { message, attachments = [] } = req.body;
  const { threadId } = req.params;

  // 设置SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    // 处理附件上下文
    let attachmentContext = '';
    if (attachments.length > 0) {
      attachmentContext = `用户上传了 ${attachments.length} 个文件：\n`;
      attachments.forEach(att => {
        attachmentContext += `- ${att.name} (${att.type})\n`;
      });
    }

    const fullContext = `${attachmentContext}\n用户消息：${message}`;
    
    // 调用AI模型生成回复
    const response = await callAIModel(fullContext, threadId);
    
    // 流式发送响应
    for (const chunk of response) {
      res.write(`data: ${JSON.stringify({ content: chunk, type: 'content' })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
```

## 安全考虑

### 1. 文件上传安全
- 限制文件大小（建议10-50MB）
- 验证文件类型（白名单）
- 扫描恶意文件
- 使用唯一文件名防止冲突
- 存储在安全目录外

### 2. 访问控制
- 实现用户认证
- 文件访问权限控制
- 防止路径遍历攻击

### 3. 错误处理
- 不暴露服务器内部信息
- 记录错误日志
- 优雅的错误响应

## 前端配置

确保在前端设置正确的API基础URL：

```typescript
// 在你的环境变量中设置
VITE_API_BASE_URL=https://your-backend-domain.com

// 或者在代码中直接设置
const API_BASE_URL = 'https://your-backend-domain.com';
```

## 部署建议

1. **文件存储**：考虑使用云存储（AWS S3, 阿里云OSS等）
2. **CDN**：为文件访问配置CDN加速
3. **数据库**：存储文件元信息和聊天记录
4. **缓存**：实现合适的缓存策略
5. **监控**：添加文件上传和API调用监控

## 测试

可以使用以下curl命令测试API：

```bash
# 测试文件上传
curl -X POST \
  -F "file=@/path/to/your/file.pdf" \
  https://your-domain.com/upload

# 测试聊天消息
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"你好","attachments":[{"name":"test.pdf","url":"..."}]}' \
  https://your-domain.com/threads/123/messages
```