import type { SALanguage } from 'src/commons/application/ApplicationTypes';
import { isSourceLanguage } from 'src/commons/application/ApplicationTypes';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';

type ChatLanguage = 'javascript' | 'python' | 'source' | 'source_js';

const getChatLanguage = (language?: SALanguage): ChatLanguage | undefined => {
  if (!language) {
    return undefined;
  }
  if (isSourceLanguage(language.chapter)) {
    return 'source';
  }
  const displayName = language.displayName.toLowerCase();
  if (displayName.includes('python')) {
    return 'python';
  }
  return 'javascript';
};

type ChatMessage = {
  id: string;
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

export async function initRagChat(tokens: Tokens): Promise<InitChatResponse> {
  const response = await request('rag_chat', 'POST', {
    ...tokens,
    body: {},
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to initialize RAG chat: ${message}`);
  }
  return await response.json();
}

export async function sendRagMessage(
  tokens: Tokens,
  userMessage: string,
  language?: SALanguage,
): Promise<ContinueChatResponse> {
  const body: any = { message: userMessage };
  const chatLanguage = getChatLanguage(language);
  if (chatLanguage) {
    body.language = chatLanguage;
  }

  const response = await request('rag_chat/message', 'POST', {
    ...tokens,
    body,
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to send RAG chat message: ${message}`);
  }
  return await response.json();
}
