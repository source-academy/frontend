import { Button, MenuItem, Tooltip } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';
import {
  AssessmentMeta,
  BinaryMeta,
  EventMeta,
  GoalMeta,
  GoalType,
  ManualMeta
} from 'src/features/achievement/AchievementTypes';

import { metaTemplate } from './GoalTemplate';
import EditableAssessmentMeta from './metaDetails/EditableAssessmentMeta';
import EditableBinaryMeta from './metaDetails/EditableBinaryMeta';
import EditableEventMeta from './metaDetails/EditableEventMeta';
import EditableManualMeta from './metaDetails/EditableManualMeta';

type Props = {
  changeMeta: (meta: GoalMeta) => void;
  meta: GoalMeta;
};

const EditableMeta: React.FC<Props> = ({ changeMeta, meta }) => {
  const { type } = meta;

  const TypeSelect = Select.ofType<GoalType>();
  const typeRenderer: ItemRenderer<GoalType> = (type, { handleClick }) => (
    <MenuItem key={type} onClick={handleClick} text={type} />
  );

  const changeType = (type: GoalType) => changeMeta(metaTemplate(type));

  const editableMetaDetails = (type: GoalType) => {
    switch (type) {
      case GoalType.ASSESSMENT:
        return (
          <EditableAssessmentMeta assessmentMeta={meta as AssessmentMeta} changeMeta={changeMeta} />
        );
      case GoalType.BINARY:
        return <EditableBinaryMeta binaryMeta={meta as BinaryMeta} changeMeta={changeMeta} />;
      case GoalType.MANUAL:
        return <EditableManualMeta changeMeta={changeMeta} manualMeta={meta as ManualMeta} />;
      case GoalType.EVENT:
        return <EditableEventMeta eventMeta={meta as EventMeta} changeMeta={changeMeta} />;
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
          onItemSelect={changeType}
        >
          <Button minimal={true} outlined={true} text={type} />
        </TypeSelect>
      </Tooltip>
      {editableMetaDetails(type)}
    </>
  );
};

export default EditableMeta;
