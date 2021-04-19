import { InputGroup, Label } from '@blueprintjs/core';
import { Variant } from 'js-slang/dist/types';
import React from 'react';

import { ControlBarChapterSelect } from '../controlBar/ControlBarChapterSelect';

export type SideContentMissionEditorProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

export const SideContentMissionEditor: React.FC<SideContentMissionEditorProps> = props => {
  return (
    <div>
      <div className="MissionEditorRow">
        <div className="MissionEditorColumn">
          <div className="MissionEditorLeftColumn">
            <Label>Mission Title</Label>
            <Label>Cover Image Link</Label>
            <Label>Mission Summary</Label>
            <Label>Mission Number</Label>
            <Label>Source Version</Label>
            <Label>Reading</Label>
          </div>
        </div>
        <div className="MissionEditorColumn">
          <div className="MissionEditorRightColumn">
            <InputGroup></InputGroup>
            <InputGroup></InputGroup>
            <InputGroup></InputGroup>
            <InputGroup></InputGroup>
            <ControlBarChapterSelect
              sourceChapter={props.sourceChapter}
              sourceVariant={props.sourceVariant}
              key="chapter"
              disabled={true}
            />
            <InputGroup></InputGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideContentMissionEditor;
