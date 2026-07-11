import type { SALanguage } from 'src/commons/application/ApplicationTypes';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';

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
  language?: SALanguage,
): Promise<ContinueChatResponse> {
  const body: any = {
    message: userMessage,
    section: section,
    initialContext: visibleText,
  };
  if (language) {
    body.language = {
      chapter: language.chapter,
      variant: language.variant,
      displayName: language.displayName,
      mainLanguage: language.mainLanguage,
    };
  }

  const response = await request(`chats/message`, 'POST', {
    ...tokens,
    body,
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
