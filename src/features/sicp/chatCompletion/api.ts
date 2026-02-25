import { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';

export async function initChat(tokens: Tokens): Promise<InitChatResponse> {
  const response = await request('chats', 'POST', {
    ...tokens,
    body: {} // Empty body
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
  visibleText: string
): Promise<ContinueChatResponse> {
  const response = await request(`chats/message`, 'POST', {
    ...tokens,
    body: {
      message: userMessage,
      section: section,
      initialContext: visibleText
    }
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

export async function initGuestChat(): Promise<InitChatResponse> {
  const response = await request('chats/guest', 'POST', {
    withCredentials: true,
    body: {}
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

export async function continueGuestChat(
  userMessage: string,
  section: string,
  visibleText: string
): Promise<ContinueChatResponse> {
  const response = await request('chats/guest/message', 'POST', {
    withCredentials: true,
    body: {
      message: userMessage,
      section: section,
      initialContext: visibleText
    }
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
