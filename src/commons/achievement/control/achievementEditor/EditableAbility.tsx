import { Button, MenuItem, Tooltip } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { AchievementAbility } from 'src/features/achievement/AchievementTypes';

type EditableAbilityProps = {
  ability: AchievementAbility;
  changeAbility: (ability: AchievementAbility) => void;
};

function EditableAbility(props: EditableAbilityProps) {
  const { ability, changeAbility } = props;

  const AbilitySelect = Select.ofType<AchievementAbility>();

  const abilityRenderer: ItemRenderer<AchievementAbility> = (ability, { handleClick }) => (
    <MenuItem key={ability} onClick={handleClick} text={ability} />
  );

  return (
    <Tooltip content="Change Ability">
      <AbilitySelect
        filterable={false}
        itemRenderer={abilityRenderer}
        items={Object.values(AchievementAbility)}
        onItemSelect={changeAbility}
      >
        <Button minimal={true} outlined={true} text={ability} />
      </AbilitySelect>
    </Tooltip>
  );
}

export default EditableAbility;
