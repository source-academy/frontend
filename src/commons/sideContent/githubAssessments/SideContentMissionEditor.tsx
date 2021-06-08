import { InputGroup, Label } from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
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
  const datePicker =
    props.missionMetadata.dueDate.getFullYear() > new Date().getFullYear() ? (
      <DatePicker onChange={handleDateChange} />
    ) : (
      <DatePicker onChange={handleDateChange} defaultValue={props.missionMetadata.dueDate} />
    );

  return (
    <div className="SideContentMissionEditor">
      <div className="SideContentMissionEditorRow">
        <div className="SideContentMissionEditorLabelColumn">
          <Label>Mission Title</Label>
          <Label>Cover Image Link</Label>
          <Label>Mission Summary</Label>
          <Label>Mission Type</Label>
          <Label>Mission Number</Label>
          <Label>Source Version</Label>
          <Label>Reading</Label>
          <Label>Due Date</Label>
        </div>
        <div className="SideContentMissionEditorOptionColumn">
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
          <InputGroup defaultValue={props.missionMetadata.kind} onChange={handleChangeKind} />
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
          {datePicker}
        </div>
      </div>
    </div>
  );

  function setMissionMetadataWrapper<T>(changedProperty: string, newValue: T) {
    const newMetadata = Object.assign({}, props.missionMetadata);
    newMetadata[changedProperty] = newValue;
    props.setMissionMetadata(newMetadata);
  }

  function handleChangeMissionTitle(event: any) {
    setMissionMetadataWrapper<string>('title', event.target.value);
  }

  function handleChangeCoverImageLink(event: any) {
    setMissionMetadataWrapper<string>('coverImage', event.target.value);
  }

  function handleChangeMissionSummary(event: any) {
    setMissionMetadataWrapper<string>('webSummary', event.target.value);
  }

  function handleChapterSelect(i: SourceLanguage, e?: React.SyntheticEvent<HTMLElement>) {
    setMissionMetadataWrapper<number>('sourceVersion', i.chapter);
  }

  function handleChangeMissionNumber(event: any) {
    setMissionMetadataWrapper<string>('number', event.target.value);
  }

  function handleChangeReading(event: any) {
    setMissionMetadataWrapper<string>('reading', event.target.value);
  }

  function handleChangeKind(event: any) {
    setMissionMetadataWrapper<string>('kind', event.target.value);
  }

  function handleDateChange(date: Date) {
    setMissionMetadataWrapper<Date>('dueDate', date);
  }
};

export default SideContentMissionEditor;
