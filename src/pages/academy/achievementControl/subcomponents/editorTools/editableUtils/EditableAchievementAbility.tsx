import React from 'react';

import { ItemRenderer, Select } from '@blueprintjs/select';
import { MenuItem, Button, Classes } from '@blueprintjs/core';

import {
  AchievementAbility,
  achievementAbilities
} from '../../../../../../commons/achievements/AchievementTypes';

type EditableAchievementAbilityProps = {
  ability: AchievementAbility;
  changeAbility: any;
};

function EditableAchievementAbility(props: EditableAchievementAbilityProps) {
  const { ability, changeAbility } = props;

  const abilityRenderer: ItemRenderer<AchievementAbility> = (ability, { handleClick }) => (
    <MenuItem active={false} key={ability} onClick={handleClick} text={ability} />
  );

  const AbilitySelectComponent = Select.ofType<AchievementAbility>();

  const abilitySelector = (currentAbility: AchievementAbility) => {
    return (
      <div>
        <Button className={Classes.MINIMAL} text={currentAbility} />
      </div>
    );
  };

  return (
    <div className="ability">
      <AbilitySelectComponent
        className={Classes.MINIMAL}
        items={achievementAbilities}
        onItemSelect={changeAbility}
        itemRenderer={abilityRenderer}
        filterable={false}
      >
        {abilitySelector(ability)}
      </AbilitySelectComponent>
    </div>
  );
}

export default EditableAchievementAbility;
