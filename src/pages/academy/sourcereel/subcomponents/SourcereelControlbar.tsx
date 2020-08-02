import { Card, Classes, Dialog, H1, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import Recorder from 'yareco';

import controlButton from '../../../../commons/ControlButton';
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
  handleSetEditorReadonly: (readonly: boolean) => void;
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
    const RecorderRecordPauseButton = controlButton(
      'Record Pause',
      IconNames.ASTERISK,
      this.props.handleRecordPause
    );
    const RecorderPauseButton = controlButton('Pause', IconNames.PAUSE, this.handleRecorderPausing);
    const RecorderResumeButton = controlButton(
      'Resume',
      IconNames.PLAY,
      this.handleRecorderResuming
    );
    const RecorderResumeFromCurrentButton = controlButton(
      'Resume Here',
      IconNames.PLAY,
      this.handleRecorderResumingFromCurrent
    );
    const RecorderStartButton = controlButton(
      'Record',
      IconNames.PLAY,
      this.handleRecorderStarting
    );
    const RecorderStopButton = controlButton('Stop', IconNames.STOP, this.handleRecorderStopping);
    const RecorderResetButton = controlButton(
      'Reset',
      IconNames.REFRESH,
      this.handleRecorderResetting
    );
    const RecorderSaveButton = controlButton(
      'Upload',
      IconNames.FLOPPY_DISK,
      this.handleOpenDialog
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
          <div className={Classes.DIALOG_BODY}>
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
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {controlButton('Confirm Upload', IconNames.TICK, this.handleRecorderSaving)}
              {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
            </div>
          </div>
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
    const { handleSetEditorReadonly, handleSetSourcecastData, handleTimerPause } = this.props;
    clearInterval(this.state.updater!);
    handleSetEditorReadonly(true);
    handleTimerPause();
    this.recorder.pause();
    const audioUrl = window.URL.createObjectURL(this.recorder.exportWAV());
    handleSetSourcecastData('', '', '', audioUrl, this.props.playbackData);
  };

  private handleRecorderStarting = () => {
    this.recorder = new Recorder();
    const { handleRecordInit, handleSetEditorReadonly, handleTimerStart } = this.props;
    this.recorder.start().then(
      () => {
        handleRecordInit();
        handleSetEditorReadonly(false);
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
    const { handleSetEditorReadonly, handleTimerResume } = this.props;
    handleSetEditorReadonly(false);
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
    const { currentPlayerTime, handleSetEditorReadonly, handleTimerResume } = this.props;
    this.handleTruncatePlaybackData();
    handleSetEditorReadonly(false);
    handleTimerResume(currentPlayerTime * 1000);
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.resume(currentPlayerTime);
  };

  private handleRecorderStopping = () => {
    if (!this.recorder) {
      return;
    }
    const { handleSetEditorReadonly, handleTimerStop } = this.props;
    handleSetEditorReadonly(false);
    handleTimerStop();
    clearInterval(this.state.updater!);
    this.recorder.stop();
    this.setState({
      fileDataBlob: this.recorder.exportWAV()
    });
    this.recorder.clear();
  };

  private handleRecorderResetting = () => {
    const { handleSetEditorReadonly, handleTimerReset } = this.props;
    handleSetEditorReadonly(false);
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
