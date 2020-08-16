import { EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';
import { GoalMeta } from 'src/features/achievement/AchievementTypes';

import ItemSaver from '../common/ItemSaver';

type EditableMetaProps = {
  meta: GoalMeta;
  changeMeta: (meta: GoalMeta) => void;
};

function EditableMeta(props: EditableMetaProps) {
  const { meta, changeMeta } = props;

  const [editableMeta, setEditableMeta] = useState<string>(JSON.stringify(meta));
  const resetEditableMeta = () => setEditableMeta(JSON.stringify(meta));

  const [isDirty, setIsDirty] = useState<boolean>(false);

  const handleChangeMeta = (metaString: string) => {
    setEditableMeta(metaString);
    setIsDirty(true);
  };

  const handleSaveChanges = () => {
    const parsedMeta = JSON.parse(editableMeta);
    changeMeta(parsedMeta);
    setIsDirty(false);
  };

  const handleDiscardChanges = () => {
    resetEditableMeta();
    setIsDirty(false);
  };

  return (
    <>
      <EditableText
        placeholder="Enter goal meta here"
        value={editableMeta}
        multiline={true}
        onChange={handleChangeMeta}
      />
      {isDirty && (
        <ItemSaver discardChanges={handleDiscardChanges} saveChanges={handleSaveChanges} />
      )}
    </>
  );
}

export default EditableMeta;
