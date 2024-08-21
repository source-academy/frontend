import { Button, Icon, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { ProgressStatus, ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useSession } from 'src/commons/utils/Hooks';

type Props = {
  submissionId: number;
  style?: React.CSSProperties;
  progress: ProgressStatus;
  filterMode: boolean;
};

const GradingActions: React.FC<Props> = ({ submissionId, style, progress, filterMode }) => {
  const dispatch = useDispatch();
  const { courseId } = useSession();

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
      dispatch(SessionActions.reautogradeSubmission(submissionId));
    }
  };

  const handleUnsubmitClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to unsubmit?',
      positiveIntent: 'danger',
      positiveLabel: 'Unsubmit'
    });
    if (confirm) {
      dispatch(SessionActions.unsubmitSubmission(submissionId));
    }
  };

  const handlePublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Publish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Publish'
    });
    if (confirm) {
      dispatch(SessionActions.publishGrading(submissionId));
    }
  };

  const handleUnpublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Unpublish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Unpublish'
    });
    if (confirm) {
      dispatch(SessionActions.unpublishGrading(submissionId));
    }
  };

  const isGraded = progress === ProgressStatuses.graded;
  const isSubmitted = progress === ProgressStatuses.submitted;
  const isPublished = progress === ProgressStatuses.published;

  return (
    <GradingFlex
      justifyContent="flex-start"
      className="grading-actions-btn-wrappers"
      style={{ columnGap: '5px', ...style }}
    >
      {filterMode && (
        <Link to={`/courses/${courseId}/grading/${submissionId}`}>
          <GradingFlex alignItems="center" className="grading-action-icons grading-action-icons-bg">
            <Tooltip content="Grade">
              <Icon icon={IconNames.EDIT} />
            </Tooltip>
          </GradingFlex>
        </Link>
      )}

      {(isGraded || isSubmitted) && (
        <Button
          className="grading-action-icons"
          minimal
          style={{ padding: 0 }}
          onClick={handleReautogradeClick}
        >
          <Tooltip content="Reautograde">
            <Icon icon={IconNames.REFRESH} />
          </Tooltip>
        </Button>
      )}

      {(isGraded || isSubmitted) && (
        <Button
          className="grading-action-icons"
          minimal
          style={{ padding: 0 }}
          onClick={handleUnsubmitClick}
        >
          <Tooltip content="Unsubmit">
            <Icon icon={IconNames.UNDO} />
          </Tooltip>
        </Button>
      )}

      {isGraded && (
        <Button className="grading-action-icons" minimal onClick={handlePublishClick}>
          <Tooltip content="Publish">
            <Icon icon={IconNames.SEND_TO_GRAPH} />
          </Tooltip>
        </Button>
      )}

      {isPublished && (
        <Button className="grading-action-icons" minimal onClick={handleUnpublishClick}>
          <Tooltip content="Unpublish">
            <Icon icon={IconNames.EXCLUDE_ROW} />
          </Tooltip>
        </Button>
      )}
    </GradingFlex>
  );
};

export default GradingActions;
