/* tslint:disable:no-console */
import { Card } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import Editor from '../workspace/Editor';
import { IPlaybackData, RecordingStatus } from './sourcecastShape';
import { Recorder } from './util';

class SourcecastRecordingControlbar extends React.PureComponent<
  ISourcecastRecordingControlbarProps,
  ISourcecastRecordingControlbarState
> {
  private recorder: any;
  private audioContext: AudioContext;

  constructor(props: ISourcecastRecordingControlbarProps) {
    super(props);
    this.state = {
      duration: 0,
      updater: undefined
    };
  }

  public async componentDidMount() {
    const constraints = { audio: true, video: false };
    let getUserMediaNow: MediaStream;

    try {
      getUserMediaNow = await navigator.mediaDevices.getUserMedia(constraints);
      this.startUserMedia(getUserMediaNow);
    } catch (error) {
      console.log('Microphone not found: ' + error);
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
    const RecorderDownloadButton = controlButton(
      'Download',
      IconNames.DOWNLOAD,
      this.handleRecorderDownloading
    );
    return (
      <div>
        <br />
        <div className="Timer">
          <Card elevation={1}>
            <h1>{this.renderLabel(this.state.duration)}</h1>
          </Card>
        </div>
        <br />
        <div className="RecorderControl">
          {this.props.recordingStatus === RecordingStatus.notStarted ? RecorderStartButton : null}
          {this.props.recordingStatus === RecordingStatus.paused ? RecorderResumeButton : null}
          {this.props.recordingStatus === RecordingStatus.recording ? RecorderPauseButton : null}
          {this.props.recordingStatus === RecordingStatus.paused ? RecorderStopButton : null}
          {this.props.recordingStatus === RecordingStatus.finished ? RecorderDownloadButton : null}
          {this.props.recordingStatus !== RecordingStatus.notStarted ? RecorderResetButton : null}
        </div>
        <br />
      </div>
    );
  }

  // private applyDeltasInstantly = () => {
  //   // ...
  // }

  private updateTimerDuration = () => {
    console.log('Updating...');
    this.setState({ duration: this.props.getTimerDuration() });
  };

  private startUserMedia = (stream: MediaStream) => {
    this.audioContext = new AudioContext();
    const input = this.audioContext.createMediaStreamSource(stream);
    this.recorder = new Recorder(input);
  };

  private handleRecorderPausing = () => {
    console.log('Pause recorder');
    const { handleSetEditorReadonly, handleTimerPause } = this.props;
    clearInterval(this.state.updater!);
    handleSetEditorReadonly(true);
    handleTimerPause();
    this.recorder.stop();
  };

  private handleRecorderStarting = () => {
    console.log('Start recorder');
    const { handleSetEditorReadonly, handleTimerStart } = this.props;
    handleSetEditorReadonly(false);
    handleTimerStart();
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.record();
  };

  private handleRecorderResuming = () => {
    console.log('Resume recorder');
    const { handleSetEditorReadonly, handleTimerResume } = this.props;
    handleSetEditorReadonly(false);
    handleTimerResume();
    const updater = setInterval(this.updateTimerDuration, 100);
    this.setState({ updater });
    this.recorder.record();
  };

  private handleRecorderStopping = () => {
    console.log('Stop recorder');
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
    console.log('Resetting...');
    const { handleSetEditorReadonly, handleTimerReset } = this.props;
    handleSetEditorReadonly(false);
    handleTimerReset();
    clearInterval(this.state.updater!);
    console.log('Reset recorder');
    this.recorder.clear();
  };

  private handleRecorderDownloading = () => {
    if (!this.state.fileDataBlob) {
      alert('No recording found');
      return;
    }
    const url = window.URL.createObjectURL(this.state.fileDataBlob);
    console.log('Download URL: ' + url);
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    const link = document.createElement('A') as HTMLAnchorElement;
    link.href = url;
    link.download = 'output.wav';
    link.dispatchEvent(click);
    link.click();
    return link;
  };

  private renderLabel = (value: number) => {
    const totalTime = value / 1000;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };
}

export interface ISourcecastRecordingControlbarProps {
  handleSetEditorReadonly: (readonly: boolean) => void;
  handleTimerPause: () => void;
  handleTimerReset: () => void;
  handleTimerResume: () => void;
  handleTimerStart: () => void;
  handleTimerStop: () => void;
  editorRef?: React.RefObject<Editor>;
  getTimerDuration: () => number;
  playbackData: IPlaybackData;
  recordingStatus: RecordingStatus;
}

export interface ISourcecastRecordingControlbarState {
  duration: number;
  fileDataBlob?: Blob;
  updater?: NodeJS.Timeout;
}

export default SourcecastRecordingControlbar;
