/* tslint:disable:no-console */
import { Card } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
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
      duration: 0
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
    const RecorderPlayButton = controlButton('Record', IconNames.PLAY, this.handleRecorderStarting);
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
        <div className="RecorderControl">
          {this.props.isRecording ? RecorderStopButton : RecorderPlayButton}
          {!!this.state.fileDataBlob && RecorderDownloadButton}
          {!this.props.isRecording && RecorderResetButton}
        </div>
      </div>
    );
  }

  private startUserMedia = (stream: MediaStream) => {
    this.audioContext = new AudioContext();
    const input = this.audioContext.createMediaStreamSource(stream);
    this.recorder = new Recorder(input);
  };

  private handleRecorderStarting = () => {
    console.log('Start recorder');
    const { handleSetSourcecastIsRecording } = this.props;
    handleSetSourcecastIsRecording(true);
    this.setState({ duration: 0 });
    const timer = setInterval(() => {
      this.setState({ duration: this.state.duration + 1 });
    }, 1000);
    this.setState({ timer });
    this.recorder.record();
  };

  private handleRecorderStopping = () => {
    console.log('Stop recorder');
    const { handleSetSourcecastIsRecording } = this.props;
    handleSetSourcecastIsRecording(false);
    this.recorder.stop();
    clearInterval(this.state.timer);
    this.createDownloadLink();
    this.recorder.clear();
  };

  private createDownloadLink = () => {
    this.recorder.exportWAV((blob: any) => {
      this.setState({
        fileDataBlob: blob
      });
      if (blob) {
        console.log('Download link created: ' + window.URL.createObjectURL(blob));
      } else {
        console.log('No recording found');
      }
    });
  };

  private handleRecorderDownloading = () => {
    const url = window.URL.createObjectURL(this.state.fileDataBlob);
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    const link = document.createElement('A') as HTMLAnchorElement;
    link.href = url;
    link.download = 'output.wav';
    link.dispatchEvent(click);
    link.click();
    return link;
  };

  private handleRecorderResetting = () => {
    console.log('Reset recorder');
    this.recorder.clear();
    this.setState({
      duration: 0
    });
  };

  private renderLabel = (value: number) => {
    const totalTime = value;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };
}

export interface ISourcecastRecordingControlbarProps {
  handleRecordEditorInput: (time: number, data: any[]) => void;
  handleSetSourcecastIsRecording: (isRecording: boolean) => void;
  isRecording: boolean;
  playbackData: any[];
}

export interface ISourcecastRecordingControlbarState {
  duration: number;
  timer?: any;
  fileDataBlob?: Blob;
}

export default SourcecastRecordingControlbar;
