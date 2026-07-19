import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';
import type { InitChatResponse, SendMessageResponse } from 'src/components/ui/chatbot/types';

export async function initChat(tokens: Tokens): Promise<InitChatResponse> {
  const response = await request('chats', 'POST', {
    ...tokens,
    body: {}, // Empty body
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to chat to louis: ${message}`);
  }
  const res = await response.json();
  return res;
}

export async function continueChat(
  tokens: Tokens,
  userMessage: string,
  section: string,
  visibleText: string,
): Promise<SendMessageResponse> {
  const response = await request(`chats/message`, 'POST', {
    ...tokens,
    body: {
      message: userMessage,
      section: section,
      initialContext: visibleText,
    },
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to chat to louis: ${message}`);
  }
  return await response.json();
}
