import { Button, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { AchievementItem } from 'src/features/achievement/AchievementTypes';

import EditableGoalIds from './achievementSettings/EditableGoalIds';
import EditablePosition from './achievementSettings/EditablePosition';
import EditablePrerequisiteIds from './achievementSettings/EditablePrerequisiteIds';

type AchievementSettingsProps = {
  changeCardBackground: (cardBackground: string) => void;
  changeGoalIds: (goalIds: number[]) => void;
  changePosition: (position: number) => void;
  changePrerequisiteIds: (prerequisiteIds: number[]) => void;
  editableAchievement: AchievementItem;
};

function AchievementSettings(props: AchievementSettingsProps) {
  const {
    changeCardBackground,
    changeGoalIds,
    changePosition,
    changePrerequisiteIds,
    editableAchievement
  } = props;
  const { id, cardBackground, goalIds, position, prerequisiteIds } = editableAchievement;

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
          <EditablePrerequisiteIds
            changePrerequisiteIds={changePrerequisiteIds}
            id={id}
            prerequisiteIds={prerequisiteIds}
          />
          <h3>Goals</h3>
          <EditableGoalIds changeGoalIds={changeGoalIds} goalIds={goalIds} />
        </div>
      </Dialog>
    </>
  );
}

export default AchievementSettings;
