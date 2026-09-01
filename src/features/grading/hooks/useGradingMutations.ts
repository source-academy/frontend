import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postReautogradeSubmission,
  postUnsubmit,
  publishGrading,
  unpublishGrading,
} from 'src/commons/sagas/RequestsSaga';
import { useTokens } from 'src/commons/utils/Hooks';
import {
  showSuccessMessage,
  showWarningMessage,
} from 'src/commons/utils/notifications/NotificationsHelper';
import { queries } from 'src/queryKeys';

// Plain-React equivalent of the saga-side `handleResponseError`.
async function showResponseError(resp: Response | null) {
  if (!resp) {
    showWarningMessage("Couldn't reach our servers. Are you online?");
    return;
  }
  let respText = await resp.text();
  if (respText.length > 100 && resp.status) {
    respText = `Something went wrong (got ${resp.status} response)`;
  }
  showWarningMessage(respText);
}

function useInvalidateOverviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queries.grading.overviews._def });
}

export function useReautogradeSubmission() {
  const tokens = useTokens();
  return useMutation({
    mutationFn: (submissionId: number) => postReautogradeSubmission(submissionId, tokens),
    onSuccess: resp => {
      if (resp && resp.ok) {
        showSuccessMessage('Autograde job queued successfully.');
        return;
      }
      if (resp && resp.status === 400) {
        showWarningMessage('Cannot reautograde non-submitted submission.');
        return;
      }
      showWarningMessage('Failed to queue autograde job.');
    },
  });
}

export function useUnsubmitSubmission() {
  const tokens = useTokens();
  const invalidateOverviews = useInvalidateOverviews();
  return useMutation({
    mutationFn: (submissionId: number) => postUnsubmit(submissionId, tokens),
    onSuccess: async resp => {
      if (!resp || !resp.ok) {
        await showResponseError(resp);
        return;
      }
      showSuccessMessage('Unsubmit successful', 1000);
      await invalidateOverviews();
    },
  });
}

export function usePublishGrading() {
  const tokens = useTokens();
  const invalidateOverviews = useInvalidateOverviews();
  return useMutation({
    mutationFn: (submissionId: number) => publishGrading(submissionId, tokens),
    onSuccess: async resp => {
      if (!resp || !resp.ok) {
        await showResponseError(resp);
        return;
      }
      showSuccessMessage('Publish grading successful', 1000);
      await invalidateOverviews();
    },
  });
}

export function useUnpublishGrading() {
  const tokens = useTokens();
  const invalidateOverviews = useInvalidateOverviews();
  return useMutation({
    mutationFn: (submissionId: number) => unpublishGrading(submissionId, tokens),
    onSuccess: async resp => {
      if (!resp || !resp.ok) {
        await showResponseError(resp);
        return;
      }
      showSuccessMessage('Unpublish grading successful', 1000);
      await invalidateOverviews();
    },
  });
}
