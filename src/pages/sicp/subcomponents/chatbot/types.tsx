interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InitChatResponse {
  response: ChatMessage;
  conversationId: string;
}

interface ContinueChatResponse {
  response: string;
  conversationId: string;
}
