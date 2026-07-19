import { Button, Icon, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { Link } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import type { ProgressStatus } from 'src/commons/assessment/AssessmentTypes';
import { ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useAppDispatch, useSession } from 'src/commons/utils/Hooks';

type Props = {
  submissionId: number;
  style?: React.CSSProperties;
  progress: ProgressStatus;
  filterMode: boolean;
};

const buttonClasses = [
  'my-auto rounded-[10px]',
  'text-blue-500 transition-[background-color] duration-100 ease-in-out',
];

function GradingActions({ submissionId, style, progress, filterMode }: Props) {
  const dispatch = useAppDispatch();
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
      positiveLabel: 'Reautograde',
    });
    if (confirm) {
      dispatch(SessionActions.reautogradeSubmission(submissionId));
    }
  };

  const handleUnsubmitClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: 'Are you sure you want to unsubmit?',
      positiveIntent: 'danger',
      positiveLabel: 'Unsubmit',
    });
    if (confirm) {
      dispatch(SessionActions.unsubmitSubmission(submissionId));
    }
  };

  const handlePublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Publish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Publish',
    });
    if (confirm) {
      dispatch(SessionActions.publishGrading(submissionId));
    }
  };

  const handleUnpublishClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: "Unpublish this assessment's grading?",
      positiveIntent: 'primary',
      positiveLabel: 'Unpublish',
    });
    if (confirm) {
      dispatch(SessionActions.unpublishGrading(submissionId));
    }
  };

  const isGraded = progress === ProgressStatuses.graded;
  const isSubmitted = progress === ProgressStatuses.submitted;
  const isPublished = progress === ProgressStatuses.published;

  return (
    <GradingFlex justifyContent="flex-start" className="gap-x-1.25 [&>a]:flex" style={style}>
      {filterMode && (
        <Tooltip position={Position.TOP} content="Grade">
          <Link to={`/courses/${courseId}/grading/${submissionId}`}>
            <Button
              variant="minimal"
              className={classNames(
                ...buttonClasses,
                'bg-[#7dbcff80] hover:bg-[#7dbcffb3] [&_svg]:fill-blue-500',
              )}
            >
              <Icon icon={IconNames.EDIT} />
            </Button>
          </Link>
        </Tooltip>
      )}

      {(isGraded || isSubmitted) && (
        <Tooltip position={Position.TOP} content="Reautograde">
          <Button
            className={classNames(...buttonClasses, '[&_svg]:fill-blue-500')}
            variant="minimal"
            onClick={handleReautogradeClick}
          >
            <Icon icon={IconNames.REFRESH} />
          </Button>
        </Tooltip>
      )}

      {(isGraded || isSubmitted) && (
        <Tooltip position={Position.TOP} content="Unsubmit">
          <Button
            variant="minimal"
            className={classNames(...buttonClasses, '[&_svg]:fill-blue-500')}
            onClick={handleUnsubmitClick}
          >
            <Icon icon={IconNames.UNDO} />
          </Button>
        </Tooltip>
      )}

      {isGraded && (
        <Tooltip position={Position.TOP} content="Publish">
          <Button
            variant="minimal"
            className={classNames(...buttonClasses, '[&_svg]:fill-blue-500')}
            onClick={handlePublishClick}
          >
            <Icon icon={IconNames.SEND_TO_GRAPH} />
          </Button>
        </Tooltip>
      )}

      {isPublished && (
        <Tooltip position={Position.TOP} content="Unpublish">
          <Button
            variant="minimal"
            className={classNames(...buttonClasses, '[&_svg]:fill-blue-500')}
            onClick={handleUnpublishClick}
          >
            <Icon icon={IconNames.EXCLUDE_ROW} />
          </Button>
        </Tooltip>
      )}
    </GradingFlex>
  );
}

export default GradingActions;
