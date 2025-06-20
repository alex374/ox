export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  designCard?: DesignCard;
}

export interface DesignCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface APIResponse {
  message: string;
  designCard?: DesignCard;
}