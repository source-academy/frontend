import { InputGroup, Label } from '@blueprintjs/core';
import { Variant } from 'js-slang/dist/types';
import React from 'react';

import { SourceLanguage } from '../application/ApplicationTypes';
import { ControlBarChapterSelect } from '../controlBar/ControlBarChapterSelect';
import MissionMetadata from '../githubAssessments/MissionMetadata';
import Constants from '../utils/Constants';

export type SideContentMissionEditorProps = {
  missionMetadata: MissionMetadata;
  setMissionMetadata: (missionMetadata: MissionMetadata) => void;
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
          <InputGroup
            defaultValue={props.missionMetadata.title}
            onChange={handleChangeMissionTitle}
          />
          <InputGroup
            defaultValue={props.missionMetadata.coverImage}
            onChange={handleChangeCoverImageLink}
          />
          <InputGroup
            defaultValue={props.missionMetadata.webSummary}
            onChange={handleChangeMissionSummary}
          />
          <InputGroup
            defaultValue={props.missionMetadata.number}
            onChange={handleChangeMissionNumber}
          />
          <ControlBarChapterSelect
            sourceChapter={props.missionMetadata.sourceVersion}
            sourceVariant={Constants.defaultSourceVariant as Variant}
            key="chapter"
            disabled={false}
            handleChapterSelect={handleChapterSelect}
          />
          <InputGroup defaultValue={props.missionMetadata.reading} onChange={handleChangeReading} />
        </div>
      </div>
    </div>
  );

  function handleChangeMissionTitle(event: any) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.title = event.target.value;
    props.setMissionMetadata(newMetadata);
  }

  function handleChangeCoverImageLink(event: any) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.coverImage = event.target.value;
    props.setMissionMetadata(newMetadata);
  }

  function handleChangeMissionSummary(event: any) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.webSummary = event.target.value;
    props.setMissionMetadata(newMetadata);
  }

  function handleChapterSelect(i: SourceLanguage, e?: React.SyntheticEvent<HTMLElement>) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.sourceVersion = i.chapter;
    props.setMissionMetadata(newMetadata);
  }

  function handleChangeMissionNumber(event: any) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.number = event.target.value;
    props.setMissionMetadata(newMetadata);
  }

  function handleChangeReading(event: any) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata.reading = event.target.value;
    props.setMissionMetadata(newMetadata);
  }
};

export default SideContentMissionEditor;
