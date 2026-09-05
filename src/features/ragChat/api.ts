import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';
import type { InitChatResponse, SendMessageResponse } from 'src/components/ui/chatbot/types';

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

export type ScreenContext = {
  code?: string;
  question?: string;
};

export async function sendRagMessage(
  tokens: Tokens,
  userMessage: string,
  screenContext?: ScreenContext,
): Promise<SendMessageResponse> {
  const response = await request('rag_chat/message', 'POST', {
    ...tokens,
    body: {
      message: userMessage,
      code: screenContext?.code,
      question: screenContext?.question,
    },
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
