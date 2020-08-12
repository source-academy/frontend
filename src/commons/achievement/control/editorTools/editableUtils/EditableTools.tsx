import { Button, Dialog, EditableText, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useContext, useState } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type EditableToolsProps = {
  cardBackground: string;
  changeCardBackground: (cardBackground: string) => void;
  changePosition: (position: number) => void;
  goalIds: number[];
  position: number;
  prerequisiteIds: number[];
};

function EditableTools(props: EditableToolsProps) {
  const {
    cardBackground,
    changeCardBackground,
    changePosition,
    goalIds,
    position,
    prerequisiteIds
  } = props;

  const inferencer = useContext(AchievementContext);

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const PositionSelect = Select.ofType<number>();
  const positionRenderer: ItemRenderer<number> = (position, { handleClick }) => (
    <MenuItem key={position} onClick={handleClick} text={position} />
  );
  const positionOptions: number[] = [];
  for (let i = 0; i <= inferencer.listTaskIds().length + 1; i++) {
    positionOptions.push(i);
  }

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
        <h3>Position</h3>
        <PositionSelect
          items={positionOptions}
          onItemSelect={changePosition}
          itemRenderer={positionRenderer}
          filterable={false}
        >
          <Button text={position} />
        </PositionSelect>
        <h3>prerequisiteIds</h3>
        <p>{prerequisiteIds}</p>
        <h3>goalIds</h3>
        <p>{goalIds}</p>
      </Dialog>
    </div>
  );
}

export default EditableTools;
