import { Card, H1, Popover } from '@blueprintjs/core';
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
  handleResetInputs: (inputs: Input[]) => void;
  handleSaveSourcecastData: (
    title: string,
    description: string,
    audio: Blob,
    playbackData: PlaybackData
  ) => void;
  handleSetSourcecastData: (
    title: string,
    description: string,
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
  duration: number;
  fileDataBlob?: Blob;
  updater?: NodeJS.Timeout;
  saveTitle: string;
  saveDescription: string;
};

class SourcereelControlbar extends React.PureComponent<SourcereelControlbarProps, State> {
  private recorder?: Recorder = undefined;

  constructor(props: SourcereelControlbarProps) {
    super(props);
    this.state = {
      duration: 0,
      updater: undefined,
      saveTitle: 'Title',
      saveDescription: 'Description'
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
    const RecorderSaveButton = (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Save', IconNames.FLOPPY_DISK)}
        <ul className="Sourcereel-save-form">
          <li className="form-row">
            <label htmlFor="title">Title: </label>
            <input
              id="title"
              value={this.state.saveTitle}
              onChange={this.handleSaveTitleInputChange}
            />
          </li>
          <li className="form-row">
            <label htmlFor="description">Description: </label>
            <input
              id="description"
              value={this.state.saveDescription}
              onChange={this.handleSaveDescriptionInputChange}
            />
          </li>
          <li>{controlButton('Submit', IconNames.TICK, this.handleRecorderSaving)}</li>
        </ul>
      </Popover>
    );
    return (
      <div>
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
          {this.props.recordingStatus === RecordingStatus.paused && RecorderStopButton}
          {/* {this.props.recordingStatus === RecordingStatus.finished && RecorderDownloadButton} */}
          {this.props.recordingStatus === RecordingStatus.finished && RecorderSaveButton}
          {this.props.recordingStatus !== RecordingStatus.notStarted && RecorderResetButton}
        </div>
        <br />
      </div>
    );
  }

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
    handleSetSourcecastData('', '', audioUrl, this.props.playbackData);
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
}

export default SourcereelControlbar;
