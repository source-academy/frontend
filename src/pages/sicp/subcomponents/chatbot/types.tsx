type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type InitChatResponse = {
  response: ChatMessage;
  conversationId: string;
  maxContentSize: number;
};

type ContinueChatResponse = {
  response: string;
  conversationId: string;
};
