import React, { useState } from 'react';

import { Card, Icon, EditableText, MenuItem, Button, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import {
  AchievementItem,
  AchievementAbility,
  achievementAbilities
} from '../../../../commons/achievements/AchievementTypes';
import AchievementDeadline from '../../achievements/subcomponents/utils/AchievementDeadline';
import AchievementExp from '../../achievements/subcomponents/utils/AchievementExp';
import { ItemRenderer, Select } from '@blueprintjs/select';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const { achievement } = props;
  const [achievementData, setAchievementData] = useState<AchievementItem>(achievement);
  const { title, ability, exp, deadline } = achievementData;

  const makeEditableTitle = () => {
    return (
      <EditableText
        placeholder={`Enter your title here`}
        value={title}
        onChange={value => {
          changeFieldTextValue(value);
        }}
      />
    );
  };

  const changeFieldTextValue = (fieldValue: string) => {
    setAchievementData({
      ...achievementData,
      title: fieldValue
    });
  };

  const changeDeadline = (deadline: Date) => {
    setAchievementData({
      ...achievementData,
      deadline: deadline
    });
  };

  const abilityRenderer: ItemRenderer<AchievementAbility> = (ability, { handleClick }) => (
    <MenuItem active={false} key={ability.toString()} onClick={handleClick} text={ability} />
  );

  const AbilitySelectComponent = Select.ofType<AchievementAbility>();

  const abilitySelector = (currentAbility: AchievementAbility) => {
    return (
      <div>
        <Button className={Classes.MINIMAL} text={currentAbility} />
      </div>
    );
  };

  const handleAbilitySelect = (ability: AchievementAbility, e: any) => {
    setAchievementData({
      ...achievementData,
      ability: ability
    });
  };

  const abilitySelect = () => (
    <AbilitySelectComponent
      className={Classes.MINIMAL}
      items={achievementAbilities}
      onItemSelect={handleAbilitySelect}
      itemRenderer={abilityRenderer}
      filterable={false}
    >
      {abilitySelector(ability)}
    </AbilitySelectComponent>
  );

  return (
    <Card className="achievement">
      <div className="main">
        <div className="icon">
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
        </div>

        <div className="display">
          <div>
            <h1>{makeEditableTitle()}</h1>
          </div>

          <div className="details">
            <div className="ability">{abilitySelect()}</div>

            <AchievementDeadline deadline={deadline} changeDeadline={changeDeadline} />

            <AchievementExp exp={exp} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;
