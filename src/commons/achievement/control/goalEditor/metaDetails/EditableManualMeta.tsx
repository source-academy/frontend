import { NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { GoalMeta, ManualMeta } from 'src/features/achievement/AchievementTypes';

type EditableManualMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  manualMeta: ManualMeta;
};

const EditableManualMeta: React.FC<EditableManualMetaProps> = ({ changeMeta, manualMeta }) => {
  const { targetCount } = manualMeta;

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...manualMeta, targetCount: targetCount });

  return (
    <Tooltip2 content="Target Count">
      <NumericInput
        allowNumericCharactersOnly={true}
        leftIcon={IconNames.BANK_ACCOUNT}
        min={0}
        onValueChange={changeTargetCount}
        placeholder="Enter target count here"
        value={targetCount}
      />
    </Tooltip2>
  );
};

export default EditableManualMeta;
