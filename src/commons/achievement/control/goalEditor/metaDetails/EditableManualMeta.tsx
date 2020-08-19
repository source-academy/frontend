import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { GoalMeta, ManualMeta } from 'src/features/achievement/AchievementTypes';

type EditableManualMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  manualMeta: ManualMeta;
};

function EditableManualMeta(props: EditableManualMetaProps) {
  const { changeMeta, manualMeta } = props;
  const { maxXp } = manualMeta;

  const changeMaxXp = (maxXp: number) => changeMeta({ ...manualMeta, maxXp: maxXp });

  return (
    <Tooltip content="Max XP">
      <NumericInput
        allowNumericCharactersOnly={true}
        leftIcon={IconNames.BANK_ACCOUNT}
        min={0}
        onValueChange={changeMaxXp}
        placeholder="Enter max XP here"
        value={maxXp}
      />
    </Tooltip>
  );
}

export default EditableManualMeta;
