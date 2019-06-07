/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { Recorder } from './util';

class SourcecastPlaybackControlbar extends React.PureComponent<
  ISourcecastPlaybackControlbarProps,
  ISourcecastPlaybackControlbarState
> {
  private audio: React.RefObject<HTMLAudioElement>;
  private recorder: any;
  private audioContext: AudioContext;

  constructor(props: ISourcecastPlaybackControlbarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentPlayerTime: 0,
      currentPlayerProgress: 0,
      duration: 0,
      isPlayerMode: true,
      fileDataBlob: null
    };
  }

  public componentDidMount() {
    const getUserMediaNow = navigator.getUserMedia;
    getUserMediaNow.call(navigator, { audio: true }, this.startUserMedia, (e: any) => {
      console.log('Microphone not found: ' + e);
    });
  }

  public render() {
    const PlayerButton = controlButton('Player Mode', IconNames.MUSIC, this.handleSetPlayerMode);
    const RecorderButton = controlButton(
      'Recorder Mode',
      IconNames.MOBILE_VIDEO,
      this.handleSetRecorderMode
    );
    const PlayerPlayButton = controlButton('Play', IconNames.PLAY, this.handlePlayerPlaying);
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    const PlayerStopButton = controlButton('Stop', IconNames.STOP, this.handlePlayerStopping);
    const RecorderPlayButton = controlButton('Record', IconNames.PLAY, this.handleRecorderStarting);
    const RecorderPauseButton = controlButton('Pause', IconNames.PAUSE, this.handleRecorderPausing);
    const RecorderStopButton = controlButton('Stop', IconNames.STOP, this.handleRecorderStopping);
    return (
      <div>
        <audio
          src="https://www.salamisound.com/stream_file/49003902987136547878968146"
          ref={this.audio}
          onLoadedMetadata={this.handleAudioLoaded}
          onTimeUpdate={this.updatePlayerTime}
          preload="metadata"
          // controls={true}
        />
        <div className="PlayerControl">
          {PlayerButton}
          {RecorderButton}
        </div>
        <br />
        {this.state.isPlayerMode ? (
          <div>
            <div className="Slider">
              <Slider
                min={0}
                max={1}
                stepSize={0.001}
                onChange={this.handlePlayerProgressBarChange}
                value={this.state.currentPlayerProgress}
                labelRenderer={this.renderLabel}
              />
            </div>
            <div className="PlayerControl">
              {PlayerPlayButton}
              {PlayerPauseButton}
              {PlayerStopButton}
            </div>
          </div>
        ) : (
          <div>
            <div className="Slider">
              <Slider min={0} max={1} stepSize={0.001} value={1} labelRenderer={this.renderLabel} />
            </div>
            <div className="PlayerControl">
              {RecorderPlayButton}
              {RecorderPauseButton}
              {RecorderStopButton}
            </div>
          </div>
        )}
      </div>
    );
  }

  private handleAudioLoaded = () => {
    this.props.handleSetSourcecastPlaybackDuration(this.audio.current!.duration);
  };

  private handleSetPlayerMode = () => {
    this.setState({
      isPlayerMode: true
    });
  };

  private handleSetRecorderMode = () => {
    this.handlePlayerStopping();
    this.setState({
      isPlayerMode: false
    });
  };

  private handlePlayerPlaying = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.play();
    handleSetSourcecastPlaybackIsPlaying(true);
    this.props.handleSetEditorReadonly(true);
  };

  private handlePlayerPausing = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    this.props.handleSetEditorReadonly(false);
    handleSetSourcecastPlaybackIsPlaying(false);
  };

  private handlePlayerStopping = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    audio!.currentTime = 0;
    handleSetSourcecastPlaybackIsPlaying(false);
    this.props.handleSetEditorReadonly(false);
    this.setState({
      currentPlayerTime: 0,
      currentPlayerProgress: 0
    });
  };

  private updatePlayerTime: React.ReactEventHandler<HTMLAudioElement> = e => {
    const { currentTime }: { currentTime: number } = e.target as HTMLMediaElement;
    this.setState({
      currentPlayerTime: currentTime,
      currentPlayerProgress: currentTime / this.props.duration
    });
  };

  private handlePlayerProgressBarChange = (value: number) => {
    if (this.audio.current) {
      const currentTime = this.props.duration * value;
      this.audio.current.currentTime = currentTime;
      this.setState({
        currentPlayerTime: currentTime,
        currentPlayerProgress: value
      });
    }
  };

  private startUserMedia = (stream: any) => {
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
    const totalTime = this.props.duration * value;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };
}

export interface ISourcecastPlaybackControlbarProps {
  handleEditorValueChange: (newCode: string) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetSourcecastPlaybackIsPlaying: (isPlaying: boolean) => void;
  handleSetSourcecastPlaybackDuration: (duration: number) => void;
  duration: number;
  isPlaying: boolean;
}

export interface ISourcecastPlaybackControlbarState {
  currentPlayerTime: number;
  currentPlayerProgress: number;
  duration: number;
  isPlayerMode: boolean;
  fileDataBlob: any;
}

export default SourcecastPlaybackControlbar;
