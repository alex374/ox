# OpenRouter + OpenAI DALL-E 混合集成

## 修改概述

已成功实现了混合 API 集成方案：使用 OpenRouter 处理聊天对话，使用 OpenAI DALL-E API 生成真实的设计稿图片。

## 完成的修改

### 1. 混合 API 服务架构
- ✅ 修改 `src/services/api.ts`：
  - OpenRouter API 用于聊天对话（GPT-4.1 Mini）
  - OpenAI API 用于图片生成（DALL-E-3）
  - 智能的设计需求检测
  - 中英文提示词转换和优化
  - 优雅的错误处理和降级机制

### 2. 双 API 密钥管理
- ✅ 修改 `src/components/Chat.tsx`：
  - 支持 OpenRouter API 密钥配置（必需）
  - 支持 OpenAI API 密钥配置（可选）
  - 更新设置界面，清晰说明各 API 的用途

### 3. 环境配置更新
- ✅ 恢复 `src/types/env.d.ts`：添加 OpenAI API 密钥类型定义
- ✅ 更新 `.env.example`：包含两个 API 密钥的配置示例

## 技术架构

### API 服务分工
```typescript
// OpenRouter: 聊天对话
const chatResponse = await axios.post(OPENROUTER_API_URL, {
  model: 'openai/gpt-4.1-mini',
  messages: [...],
  // 专业的设计师系统提示词
});

// OpenAI: 图片生成
const imageResponse = await this.openai.images.generate({
  model: "dall-e-3",
  prompt: optimizedPrompt,
  size: "1024x1024",
  quality: "standard"
});
```

### 智能检测机制
- 基于关键词的设计需求识别
- 支持中文设计术语的智能映射
- 自动判断是否需要生成设计稿

### 提示词优化
```typescript
private createImagePrompt(userMessage: string, assistantMessage: string): string {
  const basePrompt = "Create a modern, clean UI/UX design mockup for ";
  const designElements = this.extractDesignElements(userMessage + ' ' + assistantMessage);
  
  let prompt = basePrompt + userMessage.slice(0, 100);
  if (designElements.length > 0) {
    prompt += `. Include ${designElements.join(', ')}`;
  }
  prompt += ". Style: modern, minimalist, professional UI design";
  
  return prompt;
}
```

## 使用方法

### 1. 配置 API 密钥
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，添加密钥
VITE_OPENROUTER_API_KEY=your_openrouter_key  # 必需
VITE_OPENAI_API_KEY=your_openai_key          # 可选
```

### 2. 在应用中设置
- 打开应用设置界面
- 输入 OpenRouter API 密钥（必需，用于聊天）
- 输入 OpenAI API 密钥（可选，用于图片生成）

### 3. 开始使用
发送包含设计关键词的消息，例如：
- "设计一个现代化的登录页面"
- "创建一个移动端购物应用界面"
- "生成一个数据仪表板设计"

系统会自动判断并生成相应的设计稿。

## 功能特性

### 1. 智能双模式
- **有 OpenAI API**：生成真实的 DALL-E 图片
- **无 OpenAI API**：使用高质量的模拟图片

### 2. 成本优化
- OpenRouter 用于聊天（成本低）
- OpenAI 仅用于图片生成（按需调用）
- 智能检测避免不必要的图片生成

### 3. 中文优化
- 支持中文设计需求描述
- 智能的中英文术语映射
- 自动优化 DALL-E 提示词

### 4. 错误处理
- API 调用失败时优雅降级
- 详细的错误日志记录
- 保证用户体验连续性

## 支持的设计类型

```typescript
const designTerms = {
  '移动': 'mobile interface',
  '手机': 'mobile app', 
  '网页': 'web interface',
  '登录': 'login form',
  '注册': 'signup form',
  '搜索': 'search functionality',
  '列表': 'list view',
  '卡片': 'card layout',
  '按钮': 'buttons',
  '导航': 'navigation menu',
  '仪表板': 'dashboard',
  '图表': 'charts and graphs',
  '社交': 'social media interface',
  '电商': 'e-commerce interface',
  '聊天': 'chat interface'
};
```

## 技术亮点

### 1. 混合架构
- 充分利用各 API 的优势
- OpenRouter 的模型多样性 + OpenAI 的图片生成质量
- 成本效益最优化

### 2. 智能判断
- 自动识别设计需求
- 避免不必要的 API 调用
- 智能的提示词生成

### 3. 容错设计
- 多层级的错误处理
- 优雅的降级机制
- 用户体验保障

### 4. 扩展性
- 易于添加新的设计类型
- 支持更多图片生成参数
- 模块化的架构设计

## 成本考虑

### OpenRouter API
- 聊天对话成本较低
- 支持多种模型选择
- 按 token 计费

### OpenAI DALL-E API
- 按图片数量计费
- 高质量图片生成
- 建议设置使用限制

## 故障排除

### 1. 聊天功能不工作
- 检查 OpenRouter API 密钥是否正确
- 确认 API 配额是否充足

### 2. 图片生成失败
- 检查 OpenAI API 密钥是否正确
- 确认 DALL-E API 配额是否充足
- 系统会自动回退到模拟图片

### 3. 提示词优化
- 尝试使用更具体的设计描述
- 添加更多设计相关的关键词

## 未来优化方向

### 1. 图片生成增强
- 支持更多 DALL-E 参数（style, quality 等）
- 批量生成多个设计变体
- 图片编辑和修改功能

### 2. 缓存优化
- 实现图片结果缓存
- 避免重复生成相同设计
- 成本控制和优化

### 3. 用户体验
- 实时生成进度显示
- 设计历史记录管理
- 设计稿导出功能

## 注意事项

- 确保两个 API 服务的配额充足
- OpenAI API 调用可能需要几秒钟时间
- 建议在生产环境中添加速率限制
- 定期检查 API 使用情况和成本