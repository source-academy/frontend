import { Button, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import EditableGoalIds from './editableOptions/EditableGoalIds';
import EditablePosition from './editableOptions/EditablePosition';
import EditablePrerequisiteIds from './editableOptions/EditablePrerequisiteIds';

type EditableSettingsProps = {
  id: number;
  cardBackground: string;
  changeCardBackground: (cardBackground: string) => void;
  changeGoalIds: (goalIds: number[]) => void;
  changePosition: (position: number) => void;
  changePrerequisiteIds: (prerequisiteIds: number[]) => void;
  goalIds: number[];
  position: number;
  prerequisiteIds: number[];
};

function EditableSettings(props: EditableSettingsProps) {
  const {
    id,
    cardBackground,
    changeCardBackground,
    changeGoalIds,
    changePosition,
    changePrerequisiteIds,
    goalIds,
    position,
    prerequisiteIds
  } = props;

  const inferencer = useContext(AchievementContext);

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
            placeholder="Enter image URL here"
            multiline={true}
            onChange={changeCardBackground}
            value={cardBackground}
          />
          <h3>Insert before position</h3>
          <p>Note: Select position 0 to hide achievement</p>
          <EditablePosition changePosition={changePosition} position={position} />
          <h3>Prerequisites</h3>
          <EditablePrerequisiteIds
            availableIds={inferencer.listAvailablePrerequisiteIds(id)}
            changePrerequisiteIds={changePrerequisiteIds}
            prerequisiteIds={prerequisiteIds}
          />
          <h3>Goals</h3>
          <EditableGoalIds
            allGoalIds={inferencer.getAllGoalIds()}
            changeGoalIds={changeGoalIds}
            goalIds={goalIds}
          />
        </div>
      </Dialog>
    </>
  );
}

export default EditableSettings;
