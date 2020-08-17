import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { GoalMeta, ManualMeta } from 'src/features/achievement/AchievementTypes';

type EditableManualMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  meta: GoalMeta;
};

function EditableManualMeta(props: EditableManualMetaProps) {
  const { changeMeta, meta } = props;

  const manualMeta = meta as ManualMeta;
  const { maxXp } = manualMeta;

  const handleChangeMaxXp = (maxXp: number) => changeMeta({ ...manualMeta, maxXp: maxXp });

  return (
    <Tooltip content="Max XP">
      <NumericInput
        allowNumericCharactersOnly={true}
        leftIcon={IconNames.BANK_ACCOUNT}
        min={0}
        onValueChange={handleChangeMaxXp}
        placeholder="Enter max XP here"
        value={maxXp}
      />
    </Tooltip>
  );
}

export default EditableManualMeta;
