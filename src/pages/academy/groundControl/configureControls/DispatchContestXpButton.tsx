import { IconNames } from '@blueprintjs/icons';
import ControlButton from 'src/commons/ControlButton';
import { dispatchContestXp } from 'src/commons/sagas/RequestsSaga';
import { useTokens } from 'src/commons/utils/Hooks';

type Props = {
  assessmentId: number;
};

const CalculateContestScoreButton: React.FC<Props> = ({ assessmentId }) => {
  const tokens = useTokens();

  return (
    <div className="control-button-container">
      <ControlButton
        icon={IconNames.AddRowTop}
        onClick={async () => {
          dispatchContestXp(assessmentId, tokens);
        }}
        label="Dispatch Contest XP"
      />
    </div>
  );
};

export default CalculateContestScoreButton;
