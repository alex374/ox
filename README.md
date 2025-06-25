# AI 设计师助手

这是一个基于人工智能的设计师助手应用，能够理解用户的设计需求并生成相应的设计稿。

## 功能特性

- 🤖 **智能对话**: 基于 OpenRouter API 的聊天功能
- 🎨 **设计生成**: 使用 OpenAI DALL-E 生成设计稿图片
- 📱 **响应式设计**: 支持各种屏幕尺寸
- 💾 **设计稿管理**: 保存和查看生成的设计稿
- 🔐 **安全配置**: API 密钥通过环境变量配置

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 密钥

复制环境变量配置文件：

```bash
cp .env.example .env
```

在 `.env` 文件中设置您的 API 密钥：

```bash
# OpenRouter API 密钥 (必需)
VITE_OPENROUTER_API_KEY=your_actual_api_key_here

# OpenAI API 密钥 (可选，用于 DALL-E 图片生成)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 获取 OpenRouter API 密钥

1. 访问 [OpenRouter](https://openrouter.ai)
2. 注册账户并登录
3. 在仪表板中生成新的 API 密钥
4. 将密钥复制到 `.env` 文件中

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 使用方法

1. **配置完成后即可开始使用**: 确保在 `.env` 文件中正确配置了 OpenRouter API 密钥
2. **发送设计需求**: 在聊天界面输入您的设计需求，例如"设计一个移动端登录页面"
3. **获取设计建议**: AI 助手会提供专业的设计建议和解决方案
4. **查看设计稿**: 如果需求涉及具体设计，系统会自动生成设计稿
5. **管理设计稿**: 在右侧画廊中查看和管理所有生成的设计稿

## 项目结构

```
ox/
├── src/
│   ├── components/          # React 组件
│   │   ├── Chat.tsx        # 聊天组件
│   │   ├── ChatInput.tsx   # 输入组件
│   │   ├── ChatMessage.tsx # 消息组件
│   │   ├── DesignCard.tsx  # 设计稿卡片
│   │   └── DesignGallery.tsx # 设计稿画廊
│   ├── services/           # 服务层
│   │   └── api.ts         # API 服务
│   ├── types/             # 类型定义
│   │   ├── index.ts       # 主要类型
│   │   └── env.d.ts       # 环境变量类型
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 样式文件
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
└── README.md             # 项目说明
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **API 客户端**: Axios
- **AI 服务**: 
  - OpenRouter (聊天功能)
  - OpenAI (图片生成)

## API 服务

### OpenRouter API
- **用途**: 提供聊天和对话功能
- **模型**: GPT-4.1-mini
- **获取**: [https://openrouter.ai](https://openrouter.ai)

### OpenAI API (可选)
- **用途**: DALL-E 图片生成
- **模型**: DALL-E 3
- **获取**: [https://platform.openai.com](https://platform.openai.com)

## 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_OPENROUTER_API_KEY` | ✅ | OpenRouter API 密钥，用于聊天功能 |
| `VITE_OPENAI_API_KEY` | ❌ | OpenAI API 密钥，用于图片生成 |

## 常见问题

### Q: API 密钥无效
A: 请确保在 OpenRouter 网站上获取了有效的 API 密钥，并正确设置在 `.env` 文件中。

### Q: 图片生成失败
A: 如果没有配置 OpenAI API 密钥，系统会使用高质量的模拟图片作为备选方案。

### Q: 聊天功能不可用
A: 请检查：
1. OpenRouter API 密钥是否正确配置
2. 网络连接是否正常
3. API 密钥是否有足够的额度

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 许可证

MIT License
