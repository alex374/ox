import axios from 'axios';
import OpenAI from 'openai';
import { APIResponse, DesignCard } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 从环境变量获取 API 密钥
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class APIService {
  private openrouterApiKey: string;
  private openai: OpenAI | null = null;

  constructor(openrouterApiKey?: string) {
    this.openrouterApiKey = openrouterApiKey || OPENROUTER_API_KEY || '';
    
    if (this.openrouterApiKey) {
      this.openai = new OpenAI({
        apiKey: this.openrouterApiKey,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true
      });
    }
  }

  async sendMessage(message: string): Promise<APIResponse> {
    if (!this.openrouterApiKey) {
      throw new Error('OpenRouter API key is required');
    }

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'openai/gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的 UI/UX 设计师助手。你能够理解用户的设计需求，提供设计建议，并生成设计稿描述。
              
              当用户描述设计需求时，你需要：
              1. 理解用户的需求
              2. 提供专业的设计建议
              3. 生成具体的设计稿描述
              
              如果用户需要生成设计图片，你可以调用 generate_design_image 工具来生成图片。`
            },
            {
              role: 'user',
              content: message
            }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'generate_design_image',
                description: '生成 UI/UX 设计图片',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: {
                      type: 'string',
                      description: '生成图片的英文描述，应该包含设计类型、风格、颜色等信息'
                    },
                    title: {
                      type: 'string',
                      description: '设计稿的标题'
                    },
                    description: {
                      type: 'string',
                      description: '设计稿的描述'
                    }
                  },
                  required: ['prompt', 'title', 'description']
                }
              }
            }
          ],
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'AI Design Agent'
          }
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content || '';
      const toolCalls = response.data.choices[0]?.message?.tool_calls;

      let designCard: DesignCard | undefined;

      // 检查是否有工具调用
      if (toolCalls && toolCalls.length > 0) {
        const imageGenerationCall = toolCalls.find(
          (call: any) => call.function?.name === 'generate_design_image'
        );

        if (imageGenerationCall) {
          designCard = await this.handleImageGeneration(imageGenerationCall);
        }
      } else {
        // 如果没有工具调用，检查是否应该生成设计稿
        const shouldGenerateDesign = this.shouldGenerateDesignCard(message, assistantMessage);
        if (shouldGenerateDesign) {
          designCard = this.generateMockDesignCard(message);
        }
      }

      return {
        message: assistantMessage,
        designCard
      };
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  private async handleImageGeneration(toolCall: any): Promise<DesignCard> {
    try {
      const functionArgs = JSON.parse(toolCall.function?.arguments || '{}');
      const { prompt, title, description } = functionArgs;

      // 这里可以调用实际的图片生成 API
      // 由于 OpenRouter 本身不提供图片生成功能，我们需要使用外部服务
      // 或者回退到模拟图片
      
      console.log('Generated image prompt:', prompt);

      // 暂时使用模拟图片，实际项目中可以集成真实的图片生成服务
      const designCard: DesignCard = {
        id: Date.now().toString(),
        title: title || '生成的设计稿',
        description: description || '根据您的需求生成的设计稿',
        imageUrl: this.generatePlaceholderImage(prompt),
        createdAt: new Date()
      };

      return designCard;
    } catch (error) {
      console.error('Image generation error:', error);
      return this.generateMockDesignCard('工具调用生成的设计稿');
    }
  }

  private generatePlaceholderImage(prompt: string): string {
    // 生成带有提示词的占位符图片 URL
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 100));
    return `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodedPrompt}`;
  }

  private shouldGenerateDesignCard(userMessage: string, assistantMessage: string): boolean {
    const designKeywords = ['设计', '界面', '页面', '布局', '组件', 'UI', 'UX', '原型', '设计稿', '生成', '创建'];
    const messageToCheck = userMessage.toLowerCase() + ' ' + assistantMessage.toLowerCase();
    
    return designKeywords.some(keyword => messageToCheck.includes(keyword));
  }

  private generateMockDesignCard(userMessage: string): DesignCard {
    // 备用的模拟图片，当图片生成失败时使用
    const mockImages = [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561070791-36e60a6b6d1a?w=400&h=300&fit=crop'
    ];

    return {
      id: Date.now().toString(),
      title: `基于 "${userMessage.slice(0, 20)}..." 的设计稿`,
      description: `根据您的需求自动生成的设计稿`,
      imageUrl: mockImages[Math.floor(Math.random() * mockImages.length)],
      createdAt: new Date()
    };
  }
}