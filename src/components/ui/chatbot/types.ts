export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type InitChatResponse = {
  messages: ChatMessage[];
  conversationId: number;
  maxContentSize: number;
};

export type SendMessageResponse = {
  response: string;
  conversationId: number;
};