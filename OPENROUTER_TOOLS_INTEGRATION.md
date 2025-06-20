# OpenRouter 工具调用图片生成集成

## 修改概述

已成功将图片生成功能集成到 OpenRouter 的工具调用系统中，使用 GPT-4.1 Mini 模型通过工具调用的方式来触发图片生成。

## 完成的修改

### 1. API 服务升级
- ✅ 修改 `src/services/api.ts`：
  - 使用 `openai/gpt-4.1-mini` 模型
  - 实现 `generate_design_image` 工具函数
  - 智能的工具调用检测和处理
  - 生成带提示词的占位符图片
  - 保留模拟图片作为备选方案

### 2. 工具函数定义
- ✅ 定义了标准的 OpenRouter 工具调用：
  ```typescript
  {
    type: 'function',
    function: {
      name: 'generate_design_image',
      description: '生成 UI/UX 设计图片',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: '生成图片的英文描述' },
          title: { type: 'string', description: '设计稿的标题' },
          description: { type: 'string', description: '设计稿的描述' }
        },
        required: ['prompt', 'title', 'description']
      }
    }
  }
  ```

### 3. 聊天界面简化
- ✅ 修改 `src/components/Chat.tsx`：
  - 移除 OpenAI API 密钥配置
  - 简化为只需要 OpenRouter API 密钥
  - 更新设置界面和说明文字

### 4. 环境配置更新
- ✅ 更新 `src/types/env.d.ts`：移除 OpenAI API 密钥类型定义
- ✅ 更新 `.env.example`：简化为只需要 OpenRouter API 密钥

## 技术实现

### 工具调用流程
1. **用户输入**：用户描述设计需求
2. **模型理解**：GPT-4.1 Mini 理解需求并判断是否需要生成图片
3. **工具调用**：如果需要生成图片，模型调用 `generate_design_image` 工具
4. **参数提取**：系统解析工具调用的参数（prompt, title, description）
5. **图片生成**：目前生成占位符图片，未来可集成真实图片生成服务
6. **结果返回**：返回设计卡片给用户

### 占位符图片生成
```typescript
private generatePlaceholderImage(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 100));
  return `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodedPrompt}`;
}
```

### 错误处理
- 工具调用失败时自动回退到模拟图片
- JSON 解析错误的优雅处理
- 网络请求失败的错误提示

## 使用方法

### 1. 配置 API 密钥
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，添加 OpenRouter 密钥
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

### 2. 在应用中设置
- 打开应用设置界面
- 输入 OpenRouter API 密钥

### 3. 开始使用
发送包含设计关键词的消息，例如：
- "设计一个现代化的登录页面"
- "创建一个移动端购物应用界面"
- "生成一个数据仪表板设计"

GPT-4.1 Mini 会自动判断是否需要生成图片，并调用相应的工具。

## 技术亮点

### 1. 标准化工具调用
- 使用 OpenRouter 官方支持的 `type: "function"` 工具类型
- 符合 OpenAI 工具调用标准
- 完整的参数验证和类型安全

### 2. 智能化判断
- GPT-4.1 Mini 自主判断是否需要生成图片
- 自动生成合适的英文提示词
- 智能提取设计标题和描述

### 3. 优雅降级
- 工具调用失败时自动回退
- 保证用户体验的连续性
- 详细的错误日志记录

### 4. 可扩展架构
- 预留了真实图片生成服务的接口
- 易于集成 DALL-E、Midjourney 等服务
- 模块化的设计便于维护

## 当前限制

1. **占位符图片**：目前使用占位符图片，不是真实的 AI 生成图片
2. **工具调用依赖**：依赖于 GPT-4.1 Mini 的工具调用能力
3. **单一服务商**：只使用 OpenRouter，没有备选方案

## 未来优化方向

### 1. 真实图片生成集成
```typescript
// 可以集成的服务
- DALL-E API (通过 OpenAI)
- Midjourney API
- Stable Diffusion API
- 其他图片生成服务
```

### 2. 多模型支持
- 支持不同的图片生成模型
- 模型之间的智能路由
- 成本优化和质量平衡

### 3. 缓存和优化
- 图片结果缓存
- 提示词优化
- 批量生成支持

## 测试建议

1. **工具调用测试**：验证不同类型的设计需求是否能正确触发工具调用
2. **参数解析测试**：确保工具调用参数能正确解析
3. **错误处理测试**：测试各种错误情况的处理
4. **用户体验测试**：验证整个流程的用户体验

## 注意事项

- 确保 OpenRouter API 配额充足
- GPT-4.1 Mini 的工具调用可能需要几秒钟时间
- 网络环境可能影响 API 调用成功率
- 建议在测试环境中先验证功能