import React from 'react';
import { Card, Button } from '@blueprintjs/core';

type EditableAchievementTaskProps = {
  task: JSX.Element;
};

function EditableAchievementTask(props: EditableAchievementTaskProps) {
  const { task } = props;

  return (
    <div className="edit-container">
      <div className="main-cards">
        <Card>{task}</Card>
      </div>

      <div className="editor-buttons">
        <Button className="editor-button" text={'Add New Prerequisite'} />
        <Button className="editor-button" text={'Delete A Prerequisite'} />
        <Button className="editor-button" text={'Delete This Task'} />
      </div>
    </div>
  );
}

export default EditableAchievementTask;
