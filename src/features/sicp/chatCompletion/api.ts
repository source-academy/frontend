import { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';

export async function initChat(
  tokens: Tokens,
  section: string,
  textBookContent: string
): Promise<InitChatResponse> {
  const response = await request(`chats`, 'POST', {
    ...tokens,
    body: { section: section, initialContext: textBookContent }
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to chat to louis: ${message}`);
  }
  const jsonResponse = await response.text();
  return JSON.parse(jsonResponse) as InitChatResponse;
}

export async function continueChat(
  tokens: Tokens,
  chatId: string,
  userMessage: string
): Promise<ContinueChatResponse> {
  const response = await request(`chats/${chatId}/message`, 'POST', {
    ...tokens,
    body: { conversation_id: chatId, message: userMessage }
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to chat to louis: ${message}`);
  }
  const jsonResponse = await response.text();
  return JSON.parse(jsonResponse) as ContinueChatResponse;
}
