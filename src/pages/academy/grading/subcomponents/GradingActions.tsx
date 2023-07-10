import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Flex, Icon } from '@tremor/react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  publishGrades,
  reautogradeSubmission,
  unpublishGrades,
  unsubmitSubmission
} from 'src/commons/application/actions/SessionActions';
import { GradingStatus } from 'src/commons/assessment/AssessmentTypes';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type GradingActionsProps = {
  submissionId: number;
  isGradingPublished: boolean;
  gradingStatus: GradingStatus;
};

const GradingActions: React.FC<GradingActionsProps> = ({
  submissionId,
  isGradingPublished,
  gradingStatus
}) => {
  const dispatch = useDispatch();
  const courseId = useTypedSelector(store => store.session.courseId);
  const isFullyGraded = gradingStatus === 'graded';

  const handleReautogradeClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Reautograde this submission?</p>
          <p>Note: all manual adjustments will be reset to 0.</p>
        </>
      ),
      positiveIntent: 'danger',
      positiveLabel: 'Reautograde'
    });
    if (confirm) {
      dispatch(reautogradeSubmission(submissionId));
    }
  };

  const handleUnsubmitClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to unsubmit?',
      positiveIntent: 'danger',
      positiveLabel: 'Unsubmit'
    });
    if (confirm) {
      dispatch(unsubmitSubmission(submissionId));
      dispatch(unpublishGrades(submissionId));
    }
  };

  const handlePublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to publish? Student will be able to see their grade.',
      positiveIntent: 'danger',
      positiveLabel: 'Publish'
    });
    if (confirm) {
      dispatch(publishGrades(submissionId));
    }
  };

  const handleUnpublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Are you sure you want to unpublish? Student's grade will be hidden.",
      positiveIntent: 'danger',
      positiveLabel: 'Unpublish'
    });
    if (confirm) {
      dispatch(unpublishGrades(submissionId));
    }
  };

  let publishButton;
  if (isGradingPublished) {
    publishButton = (
      <button type="button" style={{ padding: 0 }} onClick={handleUnpublishClick}>
        <Icon
          tooltip="Unpublish"
          icon={() => <BpIcon icon={IconNames.RESET} />}
          variant={'simple'}
        />
      </button>
    );
  } else {
    publishButton = (
      <button
        type="button"
        style={{ padding: 0 }}
        onClick={() => (isFullyGraded ? handlePublishClick() : null)}
      >
        <Icon
          tooltip={isFullyGraded ? 'Publish' : 'Grading not complete'}
          icon={() => <BpIcon icon={IconNames.CLOUD_UPLOAD} />}
          variant={'simple'}
          color={isFullyGraded ? undefined : 'neutral'}
        />
      </button>
    );
  }

  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <Link to={`/courses/${courseId}/grading/${submissionId}`}>
        <Icon tooltip="Grade" icon={() => <BpIcon icon={IconNames.EDIT} />} variant="light" />
      </Link>

      <button type="button" style={{ padding: 0 }} onClick={handleReautogradeClick}>
        <Icon
          tooltip="Reautograde"
          icon={() => <BpIcon icon={IconNames.REFRESH} />}
          variant="simple"
        />
      </button>

      <button type="button" style={{ padding: 0 }} onClick={handleUnsubmitClick}>
        <Icon tooltip="Unsubmit" icon={() => <BpIcon icon={IconNames.UNDO} />} variant="simple" />
      </button>

      {publishButton}
    </Flex>
  );
};

export default GradingActions;
