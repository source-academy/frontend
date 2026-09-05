import { Outlet, useMatches } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import { convertParamToInt } from 'src/commons/utils/ParamParseHelper';
import RagChatbot from 'src/pages/academy/ragChatbot/RagChatbot';

// Checks the URL to see which assesment the user is looking at.
function useCurrentAssessment() {
  const matches = useMatches();
  const params = matches[matches.length - 1]?.params ?? {};

  const assessmentId = convertParamToInt(params.assessmentId);
  if (assessmentId === null) {
    return {};
  }
  // Mirrors Assessment.tsx
  return {
    assessmentId,
    questionId: convertParamToInt(params.questionId) ?? Constants.defaultQuestionId,
  };
}

// Shared by both `courses/:courseId` and `playground` in the full-academy router config (see
// routerConfig.ts) so Pixel is available on both branches without nesting `playground` under
// `courses/:courseId`, which would change its URL.
function ChatbotLayout() {
  // Courses that predate `enablePixelbot` report it as undefined; the backend defaults it to true.
  const { enablePixelbot } = useSession();
  const { assessmentId, questionId } = useCurrentAssessment();

  return (
    <>
      <Outlet />
      {enablePixelbot !== false && (
        <RagChatbot assessmentId={assessmentId} questionId={questionId} />
      )}
    </>
  );
}

export const Component = ChatbotLayout;
