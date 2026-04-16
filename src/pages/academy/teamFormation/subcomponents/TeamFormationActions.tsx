import { Button, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useSession } from 'src/commons/utils/Hooks';

type Props = {
  teamId: number;
};

const TeamFormationActions: React.FC<Props> = ({ teamId }) => {
  const dispatch = useDispatch();
  const { courseId } = useSession();

  const handleDeleteTeamClick = useCallback(async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Delete this team?</p>
          <p>Note: All submissions made by the team will be lost.</p>
        </>
      ),
      positiveIntent: 'danger',
      positiveLabel: 'Delete Team'
    });
    if (confirm) {
      dispatch(SessionActions.deleteTeam(teamId));
    }
  }, [dispatch, teamId]);

  return (
    <GradingFlex>
      <Tooltip placement={Position.TOP} content="Edit">
        <Link to={`/courses/${courseId}/teamformation/edit/${teamId}`}>
          <Button intent="primary" icon={IconNames.EDIT} variant="minimal" />
        </Link>
      </Tooltip>

      <Tooltip placement={Position.TOP} content="Delete">
        <Button
          intent="danger"
          icon={IconNames.TRASH}
          variant="minimal"
          onClick={handleDeleteTeamClick}
        />
      </Tooltip>
    </GradingFlex>
  );
};

export default TeamFormationActions;
