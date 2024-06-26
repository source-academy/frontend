import { Card, Dialog, DialogBody, DialogFooter, H1, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import Recorder from 'yareco';

import ControlButton from '../../../../commons/ControlButton';
import {
  Input,
  PlaybackData,
  RecordingStatus
} from '../../../../features/sourceRecorder/SourceRecorderTypes';

type SourcereelControlbarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleRecordInit: () => void;
  handleRecordPause: () => void;
  handleResetInputs: (inputs: Input[]) => void;
  handleSaveSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audio: Blob,
    playbackData: PlaybackData
  ) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
  handleSetIsEditorReadonly: (readonly: boolean) => void;
  handleTimerPause: () => void;
  handleTimerReset: () => void;
  handleTimerResume: (timeBefore: number) => void;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  getTimerDuration: () => number;
};

type StateProps = {
  currentPlayerTime: number;
  editorValue: string;
  playbackData: PlaybackData;
  recordingStatus: RecordingStatus;
};

type State = {
  dialogOpen: boolean;
  duration: number;
  fileDataBlob?: Blob;
  updater?: NodeJS.Timeout;
  saveTitle: string;
  saveDescription: string;
  saveUID: string;
};

class SourcereelControlbar extends React.PureComponent<SourcereelControlbarProps, State> {
  private recorder?: Recorder = undefined;

  constructor(props: SourcereelControlbarProps) {
    super(props);
    this.state = {
      dialogOpen: false,
      duration: 0,
      updater: undefined,
      saveTitle: '',
      saveDescription: '',
      saveUID: ''
    };
  }

  public async componentDidMount() {
    Recorder.getPermission().then(
      () => {},
      (error: any) => {
        alert('Microphone not found: ' + error);
      }
    );
  }

  public render() {
    const RecorderRecordPauseButton = (
      <ControlButton
        label="Record Pause"
        icon={IconNames.SNOWFLAKE}
        onClick={this.props.handleRecordPause}
      />
    );
    const RecorderPauseButton = (
      <ControlButton label="Pause" icon={IconNames.PAUSE} onClick={this.handleRecorderPausing} />
    );
    const RecorderResumeButton = (
      <ControlButton label="Resume" icon={IconNames.PLAY} onClick={this.handleRecorderResuming} />
    );
    const RecorderResumeFromCurrentButton = (
      <ControlButton
        label="Resume Here"
        icon={IconNames.PLAY}
        onClick={this.handleRecorderResumingFromCurrent}
      />
    );
    const RecorderStartButton = (
      <ControlButton label="Record" icon={IconNames.PLAY} onClick={this.handleRecorderStarting} />
    );
    const RecorderStopButton = (
      <ControlButton label="Stop" icon={IconNames.STOP} onClick={this.handleRecorderStopping} />
    );
    const RecorderResetButton = (
      <ControlButton
        label="Reset"
        icon={IconNames.REFRESH}
        onClick={this.handleRecorderResetting}
      />
    );
    const RecorderSaveButton = (
      <ControlButton label="Upload" icon={IconNames.FLOPPY_DISK} onClick={this.handleOpenDialog} />
    );
    return (
      <div>
        <Dialog
          icon="info-sign"
          isOpen={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
          title="Upload Sourcecast"
          canOutsideClickClose={true}
        >
          <DialogBody>
            <InputGroup
              id="title"
              leftIcon={IconNames.HEADER}
              onChange={this.handleSaveTitleInputChange}
              placeholder="Title"
              value={this.state.saveTitle}
            />
            <br />
            <InputGroup
              id="description"
              leftIcon={IconNames.LIST_DETAIL_VIEW}
              onChange={this.handleSaveDescriptionInputChange}
              placeholder="Description"
              value={this.state.saveDescription}
            />
            <br />
            <InputGroup
              id="uid"
              leftIcon={IconNames.KEY}
              onChange={this.handleSaveUIDInputChange}
              placeholder="UID (optional, only alphanumeric, dash and underscore allowed)"
              value={this.state.saveUID}
            />
          </DialogBody>
          <DialogFooter
            actions={
              <>
                <ControlButton
                  label="Confirm Upload"
                  icon={IconNames.TICK}
                  onClick={this.handleRecorderSaving}
                />
                <ControlButton
                  label="Cancel"
                  icon={IconNames.CROSS}
                  onClick={this.handleCloseDialog}
                />
              </>
            }
          />
        </Dialog>
        <br />
        <div className="Timer">
          <Card elevation={2} style={{ background: '#24323F' }}>
            <H1>
              {this.renderLabel(
                this.props.recordingStatus !== RecordingStatus.paused
                  ? this.state.duration / 1000
                  : this.props.currentPlayerTime
              )}
            </H1>
          </Card>
        </div>
        <br />
        <div className="RecorderControl">
          {this.props.recordingStatus === RecordingStatus.notStarted && RecorderStartButton}
          {this.props.recordingStatus === RecordingStatus.paused && RecorderResumeButton}
          {this.props.recordingStatus === RecordingStatus.paused && RecorderResumeFromCurrentButton}
          {this.props.recordingStatus === RecordingStatus.recording && RecorderPauseButton}
          {this.props.recordingStatus === RecordingStatus.recording && RecorderRecordPauseButton}
          {this.props.recordingStatus === RecordingStatus.paused && RecorderStopButton}
          {this.props.recordingStatus === RecordingStatus.finished && RecorderSaveButton}
          {this.props.recordingStatus !== RecordingStatus.notStarted && RecorderResetButton}
        </div>
        <br />
      </div>
    );
  }

  private handleCloseDialog = () => this.setState({ dialogOpen: false });

  private handleOpenDialog = () => this.setState({ dialogOpen: true });

  private updateTimerDuration = () => {
    this.setState({ duration: this.props.getTimerDuration() });
  };

  private handleTruncatePlaybackData = () => {
    const truncatedInputs = this.props.playbackData.inputs.filter(
      deltaWithTime => deltaWithTime.time <= this.props.currentPlayerTime * 1000
    );
    this.props.handleResetInputs(truncatedInputs);
  };

  private handleRecorderPausing = () => {
    if (!this.recorder) {
      return;
    }
    const { handleSetIsEditorReadonly, handleSetSourcecastData, handleTimerPause } = this.props;
    clearInterval(this.state.updater!);
    handleSetIsEditorReadonly(true);
    handleTimerPause();
    this.recorder.pause();
    const audioUrl = window.URL.createObjectURL(this.recorder.exportWAV());
    handleSetSourcecastData('', '', '', audioUrl, this.props.playbackData);
  };

  private handleRecorderStarting = () => {
    this.recorder = new Recorder();
    const { handleRecordInit, handleSetIsEditorReadonly, handleTimerStart } = this.props;
    this.recorder.start().then(
      () => {
        handleRecordInit();
        handleSetIsEditorReadonly(false);
        handleTimerStart();
        const updater = setInterval(this.updateTimerDuration, 100);
        this.setState({ updater });
        // this.recorder.onRecord = (duration: number) => console.log(duration);
      },
      (error: any) => {
        alert('Microphone not found: ' + error);
      }
    );
  };

  private handleRecorderResuming = () => {
    if (!this.recorder) {
      return;
    }
    const { handleSetIsEditorReadonly, handleTimerResume } = this.props;
    handleSetIsEditorReadonly(false);
    // -1 means resume from the end
    handleTimerResume(-1);
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.resume();
  };

  private handleRecorderResumingFromCurrent = () => {
    if (!this.recorder) {
      return;
    }
    const { currentPlayerTime, handleSetIsEditorReadonly, handleTimerResume } = this.props;
    this.handleTruncatePlaybackData();
    handleSetIsEditorReadonly(false);
    handleTimerResume(currentPlayerTime * 1000);
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.resume(currentPlayerTime);
  };

  private handleRecorderStopping = () => {
    if (!this.recorder) {
      return;
    }
    const { handleSetIsEditorReadonly, handleTimerStop } = this.props;
    handleSetIsEditorReadonly(false);
    handleTimerStop();
    clearInterval(this.state.updater!);
    this.recorder.stop();
    this.setState({
      fileDataBlob: this.recorder.exportWAV()
    });
    this.recorder.clear();
  };

  private handleRecorderResetting = () => {
    const { handleSetIsEditorReadonly, handleTimerReset } = this.props;
    handleSetIsEditorReadonly(false);
    handleTimerReset();
    clearInterval(this.state.updater!);
    this.setState({ duration: 0 });
    if (this.recorder) {
      this.recorder.stop();
      this.recorder.clear();
    }
  };

  private handleRecorderSaving = () => {
    if (!this.state.fileDataBlob) {
      alert('No recording found');
      return;
    }
    this.props.handleSaveSourcecastData(
      this.state.saveTitle,
      this.state.saveDescription,
      this.state.saveUID,
      this.state.fileDataBlob,
      this.props.playbackData
    );
  };

  private renderLabel = (value: number) => {
    const min = Math.floor(value / 60);
    const sec = Math.floor(value - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };

  private handleSaveTitleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ saveTitle: event.target.value });
  };

  private handleSaveDescriptionInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ saveDescription: event.target.value });
  };

  private handleSaveUIDInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ saveUID: event.target.value });
  };
}

export default SourcereelControlbar;
