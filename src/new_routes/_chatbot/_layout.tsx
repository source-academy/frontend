import { Outlet } from 'react-router';
import { useSession } from 'src/commons/utils/Hooks';
import RagChatbot from 'src/pages/academy/ragChatbot/RagChatbot';

// Shared by both `courses/:courseId` and `playground` in the full-academy router config (see
// routerConfig.ts) so Pixel is available on both branches without nesting `playground` under
// `courses/:courseId`, which would change its URL.
function ChatbotLayout() {
  // Courses that predate `enablePixelbot` report it as undefined; the backend defaults it to true.
  const { enablePixelbot } = useSession();

  return (
    <>
      <Outlet />
      {enablePixelbot !== false && <RagChatbot />}
    </>
  );
}

export const Component = ChatbotLayout;
