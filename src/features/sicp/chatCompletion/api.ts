import { Tokens } from 'src/commons/application/types/SessionTypes';
import { request } from 'src/commons/utils/RequestHelper';

/**
 * POST /chat
 */
export async function chat(
  tokens: Tokens,
  chatId: string,
  payload: { role: string; content: string }[]
): Promise<string> {
  const response = await request(`chat`, 'POST', {
    ...tokens,
    body: {
      conversationId: chatId,
      context: payload,
      userMessage: payload[payload.length - 1]
    }
  });
  if (!response) {
    throw new Error('Unknown error occurred.');
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to chat to louis: ${message}`);
  }
  return response.text();
}
