import { Button, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';
import { AchievementItem } from 'src/features/achievement/AchievementTypes';

import EditableGoalUuids from './achievementSettings/EditableGoalUuids';
import EditablePosition from './achievementSettings/EditablePosition';
import EditablePrerequisiteUuids from './achievementSettings/EditablePrerequisiteUuids';

type AchievementSettingsProps = {
  changeCardBackground: (cardBackground: string) => void;
  changeGoalUuids: (goalUuids: string[]) => void;
  changePosition: (position: number) => void;
  changePrerequisiteUuids: (prerequisiteUuids: string[]) => void;
  editableAchievement: AchievementItem;
};

function AchievementSettings(props: AchievementSettingsProps) {
  const {
    changeCardBackground,
    changeGoalUuids,
    changePosition,
    changePrerequisiteUuids,
    editableAchievement
  } = props;
  const { uuid, cardBackground, goalUuids, position, prerequisiteUuids } = editableAchievement;

  const [isOpen, setOpen] = useState<boolean>(false);
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
        </div>
      </Dialog>
    </>
  );
}

export default AchievementSettings;
