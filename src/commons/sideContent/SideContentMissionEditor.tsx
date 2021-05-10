import { InputGroup, Label } from '@blueprintjs/core';
import { Variant } from 'js-slang/dist/types';
import React from 'react';

import { ControlBarChapterSelect } from '../controlBar/ControlBarChapterSelect';

export type SideContentMissionEditorProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

const SideContentMissionEditor: React.FC<SideContentMissionEditorProps> = props => {
  return (
    <div>
      <div className="SideContentMissionEditorRow">
        <div className="SideContentMissionEditorColumn">
          <Label>Mission Title</Label>
          <Label>Cover Image Link</Label>
          <Label>Mission Summary</Label>
          <Label>Mission Number</Label>
          <Label>Source Version</Label>
          <Label>Reading</Label>
        </div>
        <div className="SideContentMissionEditorColumn">
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
  );
};

export default SideContentMissionEditor;
