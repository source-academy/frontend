type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type InitChatResponse = {
  messages: ChatMessage[];
  conversationId: number;
  maxContentSize: number;
};

type ContinueChatResponse = {
  response: string;
  conversationId: number;
};
