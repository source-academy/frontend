import React from 'react';
import { Button } from '@blueprintjs/core';

type EditableAchievementAdderProps = {
  addNewCard: any;
};

function EditableAchievementAdder(props: EditableAchievementAdderProps) {
  const { addNewCard } = props;

  return <Button className="main-adder" onClick={() => addNewCard()} text={'Add A New Item'} />;
}

export default EditableAchievementAdder;
