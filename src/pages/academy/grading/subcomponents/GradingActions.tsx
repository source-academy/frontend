import { Button, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  reautogradeSubmission,
  unsubmitSubmission
} from 'src/commons/application/actions/SessionActions';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type Props = {
  submissionId: number;
  style?: React.CSSProperties;
};

const GradingActions: React.FC<Props> = ({ submissionId, style }) => {
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

  return (
    <GradingFlex justifyContent="flex-start" className="grading-actions-btn-wrappers" style={{columnGap: "5px", ...style}}>
      <Link to={`/courses/${courseId}/grading/${submissionId}`}>
        <GradingFlex alignItems="center" className="grading-action-icons grading-action-icons-bg">
          <Icon htmlTitle="Grade" icon={IconNames.EDIT} />
        </GradingFlex>
      </Link>

      <Button className="grading-action-icons" minimal={true} style={{ padding: 0 }} onClick={handleReautogradeClick}>
        <Icon htmlTitle="Reautograde" icon={IconNames.REFRESH} />
      </Button>

      <Button className="grading-action-icons" minimal={true} style={{ padding: 0 }} onClick={handleUnsubmitClick}>
        <Icon htmlTitle="Unsubmit" icon={IconNames.UNDO} />
      </Button>
    </GradingFlex>
  );
};

export default GradingActions;
