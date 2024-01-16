import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Flex, Icon } from '@tremor/react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteTeam } from 'src/commons/application/actions/SessionActions';
import { showSimpleConfirmDialog } from 'src/commons/utils/DialogHelper';
import { useTypedSelector } from 'src/commons/utils/Hooks';

type TeamFormationActionsProps = {
  teamId: number;
};

const TeamFormationActions: React.FC<TeamFormationActionsProps> = ({ teamId }) => {
  const dispatch = useDispatch();
  const courseId = useTypedSelector(store => store.session.courseId);

  const handleDeleteTeamClick = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Delete this team?</p>
          <p>Note: All progress made will be lost.</p>
        </>
      ),
      positiveIntent: 'danger',
      positiveLabel: 'Delete Team'
    });
    if (confirm) {
      dispatch(deleteTeam(teamId));
    }
  };

  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <Link to={`/courses/${courseId}/teamformation/edit/${teamId}`}>
        <Icon tooltip="Edit" icon={() => <BpIcon icon={IconNames.EDIT} />} variant="light" />
      </Link>

      <button type="button" style={{ padding: 0 }} onClick={handleDeleteTeamClick}>
        <Icon tooltip="Delete" icon={() => <BpIcon icon={IconNames.TRASH} />} variant="simple" />
      </button>
    </Flex>
  );
};

export default TeamFormationActions;
