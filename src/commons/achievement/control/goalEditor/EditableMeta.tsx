import { Button, MenuItem, Tooltip } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';
import { GoalMeta, GoalType } from 'src/features/achievement/AchievementTypes';

import { metaTemplate } from './GoalTemplate';
import EditableAssessmentMeta from './metaDetails/EditableAssessmentMeta';
import EditableBinaryMeta from './metaDetails/EditableBinaryMeta';
import EditableManualMeta from './metaDetails/EditableManualMeta';

type EditableMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  meta: GoalMeta;
};

function EditableMeta(props: EditableMetaProps) {
  const { changeMeta, meta } = props;
  const { type } = meta;

  const TypeSelect = Select.ofType<GoalType>();
  const typeRenderer: ItemRenderer<GoalType> = (type, { handleClick }) => (
    <MenuItem key={type} onClick={handleClick} text={type} />
  );

  const handleChangeType = (type: GoalType) => changeMeta(metaTemplate(type));

  const editableMetaDetails = (type: GoalType) => {
    switch (type) {
      case GoalType.ASSESSMENT:
        return <EditableAssessmentMeta changeMeta={changeMeta} meta={meta} />;
      case GoalType.BINARY:
        return <EditableBinaryMeta changeMeta={changeMeta} meta={meta} />;
      case GoalType.MANUAL:
        return <EditableManualMeta changeMeta={changeMeta} meta={meta} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Tooltip content="Change Goal Type">
        <TypeSelect
          filterable={false}
          itemRenderer={typeRenderer}
          items={Object.values(GoalType)}
          onItemSelect={handleChangeType}
        >
          <Button minimal={true} outlined={true} text={type} />
        </TypeSelect>
      </Tooltip>
      {editableMetaDetails(type)}
    </>
  );
}

export default EditableMeta;
