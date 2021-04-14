import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { GoalMeta, ManualMeta } from 'src/features/achievement/AchievementTypes';

type EditableManualMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  manualMeta: ManualMeta;
};

function EditableManualMeta(props: EditableManualMetaProps) {
  const { changeMeta, manualMeta } = props;
  const { targetCount } = manualMeta;

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...manualMeta, targetCount: targetCount });

  return (
    <Tooltip content="Target Count">
      <NumericInput
        allowNumericCharactersOnly={true}
        leftIcon={IconNames.BANK_ACCOUNT}
        min={0}
        onValueChange={changeTargetCount}
        placeholder="Enter target count here"
        value={targetCount}
      />
    </Tooltip>
  );
}

export default EditableManualMeta;
