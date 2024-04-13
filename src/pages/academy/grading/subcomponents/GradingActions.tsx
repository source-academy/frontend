import { Button, Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Flex, Icon } from '@tremor/react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  publishGrading,
  reautogradeSubmission,
  unpublishGrading,
  unsubmitSubmission
} from 'src/commons/application/actions/SessionActions';
import { ProgressStatus, ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type Props = {
  submissionId: number;
  progress: ProgressStatus;
};

const GradingActions: React.FC<Props> = ({ submissionId, progress }) => {
  const dispatch = useDispatch();
  const courseId = useTypedSelector(store => store.session.courseId);

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
    }
  };

  const handlePublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Publish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Publish'
    });
    if (confirm) {
      dispatch(publishGrading(submissionId));
    }
  };

  const handleUnpublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Unpublish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Unpublish'
    });
    if (confirm) {
      dispatch(unpublishGrading(submissionId));
    }
  };

  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <Link to={`/courses/${courseId}/grading/${submissionId}`}>
        <Icon tooltip="Grade" icon={() => <BpIcon icon={IconNames.EDIT} />} variant="light" />
      </Link>

      <button
        type="button"
        style={{ padding: 0 }}
        hidden={progress !== ProgressStatuses.graded && progress !== ProgressStatuses.submitted}
        onClick={handleReautogradeClick}
      >
        <Icon
          tooltip="Reautograde"
          icon={() => <BpIcon icon={IconNames.REFRESH} />}
          variant="simple"
        />
      </button>

      <button
        type="button"
        style={{ padding: 0 }}
        hidden={progress !== ProgressStatuses.graded && progress !== ProgressStatuses.submitted}
        onClick={handleUnsubmitClick}
      >
        <Icon tooltip="Unsubmit" icon={() => <BpIcon icon={IconNames.UNDO} />} variant="simple" />
      </button>

      <Button
        onClick={handlePublishClick}
        hidden={progress !== ProgressStatuses.graded}
        text={'Publish'}
      />

      <Button
        onClick={handleUnpublishClick}
        hidden={progress !== ProgressStatuses.published}
        text={'Unpublish'}
      />
    </Flex>
  );
};

export default GradingActions;
