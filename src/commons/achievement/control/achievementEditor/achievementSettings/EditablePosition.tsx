import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type Props = {
  changePosition: (position: number) => void;
  position: number;
};

const EditablePosition: React.FC<Props> = ({ changePosition, position }) => {
  const inferencer = useContext(AchievementContext);
  const maxPosition = inferencer.listTaskUuids().length + 1;
  const positionOptions = [...Array(maxPosition + 1).keys()]; // [0..maxPosition + 1]

  const PositionSelect = Select.ofType<number>();
  const positionRenderer: ItemRenderer<number> = (position, { handleClick }) => (
    <MenuItem key={position} onClick={handleClick} text={position} />
  );

  return (
    <PositionSelect
      filterable={false}
      itemRenderer={positionRenderer}
      items={positionOptions}
      onItemSelect={changePosition}
    >
      <Button text={position} />
    </PositionSelect>
  );
};

export default EditablePosition;
