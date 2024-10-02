// This file also needs to be copied to source-academy/frontend
type BaseMessage<T extends string, P extends object> = {
  type: T;
} & P;

function createMessages<T extends Record<string, (...args: any[]) => object>>(
  creators: T
): {
  [K in Extract<keyof T, string>]: (...args: Parameters<T[K]>) => BaseMessage<K, ReturnType<T[K]>>;
} {
  return Object.fromEntries(
    Object.entries(creators).map(([key, creator]) => [
      key,
      (...args: any[]) => ({
        type: key,
        ...creator(...args)
      })
    ])
  ) as any;
}

const Messages = createMessages({
  WebviewStarted: () => ({}),
  IsVsc: () => ({}),
  NewEditor: (assessmentName: string, questionId: number, code: string) => ({
    assessmentName,
    questionId,
    code
  }),
  Text: (code: string) => ({ code })
});

export default Messages;

// Define MessageTypes to map each key in Messages to its specific message type
export type MessageTypes = {
  [K in keyof typeof Messages]: ReturnType<(typeof Messages)[K]>;
};

// Define MessageType as a union of all message types
export type MessageType = MessageTypes[keyof MessageTypes];

export const FRONTEND_ELEMENT_ID = 'frontend';

export function sendToWebview(message: MessageType) {
  window.parent.postMessage(message, '*');
}
export function sendToFrontend(document: Document, message: MessageType) {
  const iframe: HTMLIFrameElement = document.getElementById(
    FRONTEND_ELEMENT_ID
  ) as HTMLIFrameElement;
  const contentWindow = iframe.contentWindow;
  if (!contentWindow) {
    return;
  }
  // TODO: Don't hardcode this!
  contentWindow.postMessage(message, 'http://localhost:8000');
}
