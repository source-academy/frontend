import { IconNames } from '@blueprintjs/icons';
import ControlButton from 'src/commons/ControlButton';
import { maximumTasksPerMission } from 'src/commons/githubAssessments/GitHubMissionDataUtils';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

export type ControlBarTaskAddButtonProps = {
  addNewQuestion: () => void;
  numberOfTasks: number;
  key: string;
};

export const ControlBarTaskAddButton: React.FC<ControlBarTaskAddButtonProps> = props => {
  function onClickAdd() {
    if (props.numberOfTasks === maximumTasksPerMission) {
      showWarningMessage(
        'Cannot have more than ' + maximumTasksPerMission + ' Tasks in a Mission!'
      );
      return;
    }

    props.addNewQuestion();
  }

  return <ControlButton label="Add Task" icon={IconNames.ADD} onClick={onClickAdd} />;
};
