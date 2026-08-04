import { Outlet } from 'react-router';
import RagChatbot from 'src/pages/academy/ragChatbot/RagChatbot';

// Shared by both `courses/:courseId` and `playground` in the full-academy router config (see
// routerConfig.ts) so Pixel is available on both branches without nesting `playground` under
// `courses/:courseId`, which would change its URL.
function ChatbotLayout() {
  return (
    <>
      <Outlet />
      <RagChatbot />
    </>
  );
}

export const Component = ChatbotLayout;
