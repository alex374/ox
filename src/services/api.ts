import axios from 'axios';
import { APIResponse, DesignCard } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 从环境变量获取 API 密钥
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class APIService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY || '';
  }

  async sendMessage(message: string): Promise<APIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'openai/gpt-4',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的 UI/UX 设计师助手。你能够理解用户的设计需求，提供设计建议，并生成设计稿描述。
              
              当用户描述设计需求时，你需要：
              1. 理解用户的需求
              2. 提供专业的设计建议
              3. 生成具体的设计稿描述
              
              回复格式应该包含设计建议和具体的设计描述。如果需要生成设计稿，请在回复中明确说明设计稿的特征。`
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'AI Design Agent'
          }
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content || '';
      
      // 简单的设计稿检测逻辑 - 实际应用中可能需要更复杂的逻辑
      const shouldGenerateDesign = this.shouldGenerateDesignCard(message, assistantMessage);
      
      let designCard: DesignCard | undefined;
      if (shouldGenerateDesign) {
        designCard = this.generateMockDesignCard(message);
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

  private shouldGenerateDesignCard(userMessage: string, assistantMessage: string): boolean {
    const designKeywords = ['设计', '界面', '页面', '布局', '组件', 'UI', 'UX', '原型', '设计稿'];
    const messageToCheck = userMessage.toLowerCase() + ' ' + assistantMessage.toLowerCase();
    
    return designKeywords.some(keyword => messageToCheck.includes(keyword));
  }

  private generateMockDesignCard(userMessage: string): DesignCard {
    // 这里使用模拟图片，实际应用中可能需要调用图片生成API
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