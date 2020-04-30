import { Card, H1, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { IPlaybackData, RecordingStatus } from './sourcecastShape';
import { Recorder } from './util';

class SourcereelControlbar extends React.PureComponent<
  ISourcereelControlbarProps,
  ISourcereelControlbarState
> {
  private recorder: any;
  private audioContext: AudioContext;

  constructor(props: ISourcereelControlbarProps) {
    super(props);
    this.state = {
      duration: 0,
      updater: undefined,
      saveTitle: 'Title',
      saveDescription: 'Description'
    };
  }

  public async componentDidMount() {
    const constraints = { audio: true, video: false };
    let getUserMediaNow: MediaStream;

    try {
      getUserMediaNow = await navigator.mediaDevices.getUserMedia(constraints);
      this.startUserMedia(getUserMediaNow);
    } catch (error) {
      alert('Microphone not found: ' + error);
    }
  }

  public render() {
    const RecorderPauseButton = controlButton('Pause', IconNames.PAUSE, this.handleRecorderPausing);
    const RecorderResumeButton = controlButton(
      'Resume',
      IconNames.PLAY,
      this.handleRecorderResuming
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
    // const RecorderDownloadButton = controlButton(
    //   'Download',
    //   IconNames.DOWNLOAD,
    //   this.handleRecorderDownloading
    // );
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
            <H1>{this.renderLabel(this.state.duration)}</H1>
          </Card>
        </div>
        <br />
        <div className="RecorderControl">
          {this.props.recordingStatus === RecordingStatus.notStarted && RecorderStartButton}
          {this.props.recordingStatus === RecordingStatus.paused && RecorderResumeButton}
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

  private startUserMedia = (stream: MediaStream) => {
    this.audioContext = new AudioContext();
    const input = this.audioContext.createMediaStreamSource(stream);
    this.recorder = new Recorder(input);
  };

  private handleRecorderPausing = () => {
    const { handleSetEditorReadonly, handleTimerPause } = this.props;
    clearInterval(this.state.updater!);
    handleSetEditorReadonly(true);
    handleTimerPause();
    this.recorder.stop();
  };

  private handleRecorderStarting = () => {
    const { handleRecordInit, handleSetEditorReadonly, handleTimerStart } = this.props;
    handleRecordInit();
    handleSetEditorReadonly(false);
    handleTimerStart();
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.record();
  };

  private handleRecorderResuming = () => {
    const { handleSetEditorReadonly, handleTimerResume } = this.props;
    handleSetEditorReadonly(false);
    handleTimerResume();
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.record();
  };

  private handleRecorderStopping = () => {
    const { handleSetEditorReadonly, handleTimerStop } = this.props;
    handleSetEditorReadonly(false);
    handleTimerStop();
    clearInterval(this.state.updater!);
    this.recorder.stop();
    this.recorder.exportWAV((blob: any) => {
      this.setState({
        fileDataBlob: blob
      });
    });
    this.recorder.clear();
  };

  private handleRecorderResetting = () => {
    const { handleSetEditorReadonly, handleTimerReset } = this.props;
    handleSetEditorReadonly(false);
    handleTimerReset();
    clearInterval(this.state.updater!);
    this.setState({ duration: 0 });
    this.recorder.stop();
    this.recorder.clear();
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

  // private handleRecorderDownloading = () => {
  //   if (!this.state.fileDataBlob) {
  //     alert('No recording found');
  //     return;
  //   }
  //   const url = window.URL.createObjectURL(this.state.fileDataBlob);
  //   this.props.handleRecordAudioUrl(url);
  //   const click = document.createEvent('Event');
  //   click.initEvent('click', true, true);
  //   const link = document.createElement('A') as HTMLAnchorElement;
  //   link.href = url;
  //   link.download = 'output.wav';
  //   link.dispatchEvent(click);
  //   link.click();
  //   return link;
  // };

  private renderLabel = (value: number) => {
    const totalTime = value / 1000;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
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

export interface ISourcereelControlbarProps {
  handleRecordInit: () => void;
  handleSaveSourcecastData: (
    title: string,
    description: string,
    audio: Blob,
    playbackData: IPlaybackData
  ) => void;
  handleSetEditorReadonly: (readonly: boolean) => void;
  handleTimerPause: () => void;
  handleTimerReset: () => void;
  handleTimerResume: () => void;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  editorValue: string;
  getTimerDuration: () => number;
  playbackData: IPlaybackData;
  recordingStatus: RecordingStatus;
}

export interface ISourcereelControlbarState {
  duration: number;
  fileDataBlob?: Blob;
  updater?: NodeJS.Timeout;
  saveTitle: string;
  saveDescription: string;
}

export default SourcereelControlbar;
