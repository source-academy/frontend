import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { GoalMeta, ManualMeta } from 'src/features/achievement/AchievementTypes';

type Props = {
  changeMeta: (meta: GoalMeta) => void;
  manualMeta: ManualMeta;
};

const EditableManualMeta: React.FC<Props> = ({ changeMeta, manualMeta }) => {
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
};

export default EditableManualMeta;
