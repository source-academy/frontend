/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { Recorder } from './util';

class SourcecastRecordingControlbar extends React.PureComponent<
  ISourcecastRecordingControlbarProps
> {
  private recorder: any;
  private audioContext: AudioContext;

  constructor(props: ISourcecastRecordingControlbarProps) {
    super(props);
    this.state = {
      fileDataBlob: null
    };
  }

  public async componentDidMount() {
    const constraints = { audio: true, video: false };
    let getUserMediaNow: MediaStream;

    try {
      getUserMediaNow = await navigator.mediaDevices.getUserMedia(constraints);
      this.startUserMedia(getUserMediaNow);
      console.log(getUserMediaNow);
    } catch (error) {
      console.log('Microphone not found: ' + error);
    }
  }

  public render() {
    const RecorderPlayButton = controlButton('Record', IconNames.PLAY, this.handleRecorderStarting);
    const RecorderPauseButton = controlButton('Pause', IconNames.PAUSE, this.handleRecorderPausing);
    const RecorderStopButton = controlButton('Stop', IconNames.STOP, this.handleRecorderStopping);
    return (
      <div>
        <br />
        <div className="Slider">
          <Slider min={0} max={1} stepSize={0.001} value={1} labelRenderer={this.renderLabel} />
        </div>
        <div className="PlayerControl">
          {RecorderPlayButton}
          {RecorderPauseButton}
          {RecorderStopButton}
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
    this.recorder.record();
    console.log('Start recording');
  };

  private handleRecorderPausing = () => {
    this.recorder.stop();
    console.log('Pause recording');
  };

  private handleRecorderStopping = () => {
    this.recorder.stop();
    console.log('Stop recording');
    this.createDownloadLink();
    this.recorder.clear();
  };

  private createDownloadLink = () => {
    this.recorder.exportWAV((blob: any) => {
      console.log(blob);
      this.setState({
        fileDataBlob: blob
      });
      if (!blob) {
        console.log('No recording');
      } else {
        console.log('Download link created: ' + URL.createObjectURL(blob));
      }
    });
  };

  private renderLabel = (value: number) => {
    const totalTime = 100 * value;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };
}

export interface ISourcecastRecordingControlbarProps {
  handleRecordEditorInput: (time: number, data: any[]) => void;
  isRecording: boolean;
  playbackData: any[];
}

export interface ISourcecastPlaybackControlbarState {
  currentPlayerTime: number;
  currentPlayerProgress: number;
  duration: number;
  isPlayerMode: boolean;
  fileDataBlob: any;
}

export default SourcecastRecordingControlbar;
