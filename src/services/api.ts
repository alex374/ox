import axios from 'axios';
import OpenAI from 'openai';
import { APIResponse, DesignCard } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 从环境变量获取 API 密钥
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export class APIService {
  private openrouterApiKey: string;
  private openai: OpenAI | null = null;

  constructor(openrouterApiKey?: string, openaiApiKey?: string) {
    this.openrouterApiKey = openrouterApiKey || OPENROUTER_API_KEY || '';
    
    const actualOpenaiKey = openaiApiKey || OPENAI_API_KEY;
    if (actualOpenaiKey) {
      this.openai = new OpenAI({
        apiKey: actualOpenaiKey,
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
            'Authorization': `Bearer ${this.openrouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'AI Design Agent'
          }
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content || '';
      
      // 检查是否应该生成设计稿
      const shouldGenerateDesign = this.shouldGenerateDesignCard(message, assistantMessage);
      
      let designCard: DesignCard | undefined;
      if (shouldGenerateDesign) {
        designCard = await this.generateDesignCard(message, assistantMessage);
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
    const designKeywords = ['设计', '界面', '页面', '布局', '组件', 'UI', 'UX', '原型', '设计稿', '生成', '创建'];
    const messageToCheck = userMessage.toLowerCase() + ' ' + assistantMessage.toLowerCase();
    
    return designKeywords.some(keyword => messageToCheck.includes(keyword));
  }

  private async generateDesignCard(userMessage: string, assistantMessage: string): Promise<DesignCard> {
    try {
      if (this.openai) {
        // 使用 OpenAI DALL-E 生成真实图片
        const imagePrompt = this.createImagePrompt(userMessage, assistantMessage);
        
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        });

        const imageUrl = response.data?.[0]?.url;
        
        if (imageUrl) {
          return {
            id: Date.now().toString(),
            title: `基于 "${userMessage.slice(0, 30)}..." 的设计稿`,
            description: `根据您的需求使用 AI 生成的设计稿`,
            imageUrl: imageUrl,
            createdAt: new Date()
          };
        }
      }
      
      // 如果 OpenAI API 不可用，回退到模拟图片
      return this.generateMockDesignCard(userMessage);
    } catch (error) {
      console.error('Image generation error:', error);
      // 出错时回退到模拟图片
      return this.generateMockDesignCard(userMessage);
    }
  }

  private createImagePrompt(userMessage: string, assistantMessage: string): string {
    // 创建适合 DALL-E 的图片生成提示词
    const basePrompt = "Create a modern, clean UI/UX design mockup for ";
    
    // 提取关键设计元素
    const designElements = this.extractDesignElements(userMessage + ' ' + assistantMessage);
    
    let prompt = basePrompt + userMessage.slice(0, 100);
    
    if (designElements.length > 0) {
      prompt += `. Include ${designElements.join(', ')}`;
    }
    
    prompt += ". Style: modern, minimalist, professional UI design, clean interface, user-friendly layout";
    
    return prompt;
  }

  private extractDesignElements(text: string): string[] {
    const elements: string[] = [];
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

    for (const [chinese, english] of Object.entries(designTerms)) {
      if (text.includes(chinese)) {
        elements.push(english);
      }
    }

    return elements;
  }

  private generateMockDesignCard(userMessage: string): DesignCard {
    // 备用的模拟图片，当 OpenAI API 不可用时使用
    const mockImages = [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561070791-36e60a6b6d1a?w=400&h=300&fit=crop'
    ];

    return {
      id: Date.now().toString(),
      title: `基于 "${userMessage.slice(0, 20)}..." 的设计稿`,
      description: `根据您的需求自动生成的设计稿（模拟）`,
      imageUrl: mockImages[Math.floor(Math.random() * mockImages.length)],
      createdAt: new Date()
    };
  }
}