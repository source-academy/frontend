import { Button, Dialog, EditableText } from '@blueprintjs/core';
import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import EditableGoalIds from './editableOptions/EditableGoalIds';
import EditablePosition from './editableOptions/EditablePosition';
import EditablePrerequisiteIds from './editableOptions/EditablePrerequisiteIds';

type EditableOptionsProps = {
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

function EditableOptions(props: EditableOptionsProps) {
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
    <div className="editable-tool">
      <Button text="More Options" onClick={toggleOpen} />

      <Dialog title="More Options" isOpen={isOpen} onClose={toggleOpen}>
        <h3>Card Background</h3>
        <EditableText
          placeholder="Enter image URL here"
          multiline={true}
          onChange={changeCardBackground}
          value={cardBackground}
        />
        <h3>
          Insert before position:
          <EditablePosition changePosition={changePosition} position={position} />
        </h3>
        <h3>Prerequisite Ids</h3>
        <EditablePrerequisiteIds
          availableIds={inferencer.listAvailablePrerequisiteIds(id)}
          changePrerequisiteIds={changePrerequisiteIds}
          prerequisiteIds={prerequisiteIds}
        />
        <h3>Goal Ids</h3>
        <EditableGoalIds
          allGoalIds={inferencer.listAllGoalIds()}
          changeGoalIds={changeGoalIds}
          goalIds={goalIds}
        />
      </Dialog>
    </div>
  );
}

export default EditableOptions;
