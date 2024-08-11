type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type InitChatResponse = {
  response: ChatMessage;
  conversationId: string;
};

type ContinueChatResponse = {
  response: string;
  conversationId: string;
};
