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
  const chatLanguage = getChatLanguage(language);
  if (chatLanguage) {
    body.language = chatLanguage;
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
