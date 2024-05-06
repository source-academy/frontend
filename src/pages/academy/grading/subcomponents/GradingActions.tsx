import { Button, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { ProgressStatus, ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type Props = {
  submissionId: number;
  style?: React.CSSProperties;
  progress: ProgressStatus;
  filterMode: boolean;
};

const GradingActions: React.FC<Props> = ({ submissionId, style, progress, filterMode }) => {
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

  return (
    <GradingFlex
      justifyContent="flex-start"
      className="grading-actions-btn-wrappers"
      style={{ columnGap: '5px', ...style }}
    >
      {filterMode ? (
        <Link to={`/courses/${courseId}/grading/${submissionId}`}>
          <GradingFlex alignItems="center" className="grading-action-icons grading-action-icons-bg">
            <Icon htmlTitle="Grade" icon={IconNames.EDIT} />
          </GradingFlex>
        </Link>
      ) : (
        <></>
      )}

      {!(progress !== ProgressStatuses.graded && progress !== ProgressStatuses.submitted) ? (
        <Button
          className="grading-action-icons"
          minimal={true}
          style={{ padding: 0 }}
          onClick={handleReautogradeClick}
        >
          <Icon htmlTitle="Reautograde" icon={IconNames.REFRESH} />
        </Button>
      ) : (
        <></>
      )}

      {!(progress !== ProgressStatuses.graded && progress !== ProgressStatuses.submitted) ? (
        <Button
          className="grading-action-icons"
          minimal={true}
          style={{ padding: 0 }}
          onClick={handleUnsubmitClick}
        >
          <Icon htmlTitle="Unsubmit" icon={IconNames.UNDO} />
        </Button>
      ) : (
        <></>
      )}

      {!(progress !== ProgressStatuses.graded) ? (
        <Button className="grading-action-icons" minimal={true} onClick={handlePublishClick}>
          <Icon htmlTitle="Publish" icon={IconNames.SEND_TO_GRAPH} />
        </Button>
      ) : (
        <></>
      )}

      {!(progress !== ProgressStatuses.published) ? (
        <Button className="grading-action-icons" minimal={true} onClick={handleUnpublishClick}>
          <Icon htmlTitle="Unpublish" icon={IconNames.EXCLUDE_ROW} />
        </Button>
      ) : (
        <></>
      )}
    </GradingFlex>
  );
};

export default GradingActions;
