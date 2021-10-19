import { Label } from '@blueprintjs/core';
import { Variant } from 'js-slang/dist/types';
import React from 'react';

import { SourceLanguage } from '../../application/ApplicationTypes';
import { ControlBarChapterSelect } from '../../controlBar/ControlBarChapterSelect';
import { MissionMetadata } from '../../githubAssessments/GitHubMissionTypes';
import Constants from '../../utils/Constants';

export type SideContentMissionEditorProps = {
  missionMetadata: MissionMetadata;
  setMissionMetadata: (missionMetadata: MissionMetadata) => void;
};

const SideContentMissionEditor: React.FC<SideContentMissionEditorProps> = props => {
  return (
    <div className="SideContentMissionEditor">
      <div className="SideContentMissionEditorRow">
        <div className="SideContentMissionEditorLabelColumn">
          <Label>Source Version</Label>
        </div>
        <div className="SideContentMissionEditorOptionColumn">
          <ControlBarChapterSelect
            sourceChapter={props.missionMetadata.sourceVersion}
            sourceVariant={Constants.defaultSourceVariant as Variant}
            key="chapter"
            disabled={false}
            handleChapterSelect={handleChapterSelect}
          />
        </div>
      </div>
    </div>
  );

  function setMissionMetadataWrapper<T>(changedProperty: string, newValue: T) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata[changedProperty] = newValue;
    props.setMissionMetadata(newMetadata);
  }

  function handleChapterSelect(i: SourceLanguage, e?: React.SyntheticEvent<HTMLElement>) {
    setMissionMetadataWrapper<number>('sourceVersion', i.chapter);
  }
};

export default SideContentMissionEditor;
