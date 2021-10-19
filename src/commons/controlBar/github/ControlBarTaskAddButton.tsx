import { IconNames } from '@blueprintjs/icons';

import controlButton from '../../ControlButton';
import { maximumTasksPerMission } from '../../githubAssessments/GitHubMissionDataUtils';
import { showWarningMessage } from '../../utils/NotificationsHelper';

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

  return controlButton('Add Task', IconNames.ADD, onClickAdd);
};
