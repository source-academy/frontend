import { NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { GoalMeta, XpMeta } from 'src/features/achievement/AchievementTypes';

type EditableXpMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  xpMeta: XpMeta;
};

function EditableXpMeta(props: EditableXpMetaProps) {
  const { changeMeta, xpMeta } = props;
  const { targetCount } = xpMeta;

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...xpMeta, targetCount: targetCount });

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
}

export default EditableXpMeta;
