import { NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { AchievementsMeta, GoalMeta } from 'src/features/achievement/AchievementTypes';

type EditableAchievementsMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  achievementsMeta: AchievementsMeta;
};

function EditableAchievementsMeta(props: EditableAchievementsMetaProps) {
  const { changeMeta, achievementsMeta } = props;
  const { targetCount } = achievementsMeta;

  const changeTargetCount = (targetCount: number) =>
    changeMeta({ ...achievementsMeta, targetCount: targetCount });

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

export default EditableAchievementsMeta;
