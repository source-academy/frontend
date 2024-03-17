import { Button, Checkbox, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { AchievementItem } from 'src/features/achievement/AchievementTypes';

import EditableGoalUuids from './achievementSettings/EditableGoalUuids';
import EditablePosition from './achievementSettings/EditablePosition';
import EditablePrerequisiteUuids from './achievementSettings/EditablePrerequisiteUuids';

type Props = {
  changeCardBackground: (cardBackground: string) => void;
  changeGoalUuids: (goalUuids: string[]) => void;
  changePosition: (position: number) => void;
  changePrerequisiteUuids: (prerequisiteUuids: string[]) => void;
  changeIsVariableXp: () => void;
  editableAchievement: AchievementItem;
};

const AchievementSettings: React.FC<Props> = ({
  changeCardBackground,
  changeGoalUuids,
  changePosition,
  changePrerequisiteUuids,
  changeIsVariableXp,
  editableAchievement
}) => {
  const { uuid, cardBackground, goalUuids, position, prerequisiteUuids, isVariableXp } =
    editableAchievement;

  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <>
      <Tooltip content="More Settings">
        <Button icon={IconNames.WRENCH} onClick={toggleOpen} />
      </Tooltip>

      <Dialog title="More Settings" icon={IconNames.WRENCH} isOpen={isOpen} onClose={toggleOpen}>
        <div style={{ padding: '0 0.5em' }}>
          <h3>Card Background</h3>
          <EditableText
            multiline={true}
            onChange={changeCardBackground}
            placeholder="Enter card background URL here"
            value={cardBackground}
          />
          <h3>Position</h3>
          <p>Note: Select position 0 to hide achievement</p>
          <EditablePosition changePosition={changePosition} position={position} />
          <h3>Prerequisites</h3>
          <EditablePrerequisiteUuids
            changePrerequisiteUuids={changePrerequisiteUuids}
            uuid={uuid}
            prerequisiteUuids={prerequisiteUuids}
          />
          <h3>Goals</h3>
          <EditableGoalUuids changeGoalUuids={changeGoalUuids} goalUuids={goalUuids} />

          <h3>Variable XP</h3>
          <Checkbox
            label={"The rewarded XP will be equal to the sum of 'count' of goals"}
            checked={isVariableXp}
            onChange={changeIsVariableXp}
          />
        </div>
      </Dialog>
    </>
  );
};

export default AchievementSettings;
