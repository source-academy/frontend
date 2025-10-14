import { IconNames } from '@blueprintjs/icons';
import ControlButton from 'src/commons/ControlButton';
import { calculateContestScore } from 'src/commons/sagas/RequestsSaga';
import { useTokens } from 'src/commons/utils/Hooks';

type Props = {
  assessmentId: number;
};

const CalculateContestScoreButton: React.FC<Props> = ({ assessmentId }) => {
  const tokens = useTokens();

  return (
    <div className="control-button-container">
      <ControlButton
        icon={IconNames.CALCULATOR}
        onClick={async () => {
          calculateContestScore(assessmentId, tokens);
        }}
        label="Calculate Contest Score"
      />
    </div>
  );
};

export default CalculateContestScoreButton;
