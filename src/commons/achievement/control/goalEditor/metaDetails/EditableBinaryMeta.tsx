import { EditableText, NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { BinaryMeta, GoalMeta } from 'src/features/achievement/AchievementTypes';

type EditableBinaryMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  meta: GoalMeta;
};

function EditableBinaryMeta(props: EditableBinaryMetaProps) {
  const { changeMeta, meta } = props;

  const binaryMeta = meta as BinaryMeta;
  const { condition, maxXp } = binaryMeta;

  const handleChangeCondition = (conditionString: string) => {
    const condition = JSON.parse(conditionString);
    changeMeta({ ...binaryMeta, condition: condition });
  };

  const handleChangeMaxXp = (maxXp: number) => changeMeta({ ...binaryMeta, maxXp: maxXp });

  return (
    <>
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
      <Tooltip content="Condition">
        <EditableText
          onChange={handleChangeCondition}
          multiline={true}
          placeholder="Enter condition here"
          value={JSON.stringify(condition)}
        />
      </Tooltip>
    </>
  );
}

export default EditableBinaryMeta;
