/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';

interface IRecordingData {
  value: string;
  time: number;
}

class SourcecastPlaybackControlbar extends React.PureComponent<
  ISourcecastPlaybackControlbarProps,
  ISourcecastPlaybackControlbarState
> {
  private audio: React.RefObject<HTMLAudioElement>;
  private mockData: IRecordingData[];

  constructor(props: ISourcecastPlaybackControlbarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentPlayerTime: 0,
      currentPlayerProgress: 0,
      duration: 0,
      isPlayerMode: true
    };
    this.mockData = [
      { value: '', time: 0 },
      { value: 'a', time: 1000 },
      { value: 'ab', time: 2000 },
      { value: 'abc', time: 3000 },
      { value: 'abcd', time: 4000 },
      { value: 'abcde', time: 4500 },
      { value: 'abcdef', time: 4800 },
      { value: 'abcdefg', time: 5100 },
      { value: 'abcdefgh', time: 5400 },
      { value: 'abcdefghi', time: 6400 },
      { value: 'abcdefghij', time: 6900 },
      { value: 'abcdefghijk', time: 7500 },
      { value: 'abcdefghijkl', time: 7900 },
      { value: 'abcdefghijklm', time: 8100 },
      { value: 'abcdefghijklmn', time: 8500 },
      { value: 'abcdefghijklmno', time: 9100 },
      { value: 'abcdefghijklmnop', time: 9900 },
      { value: 'abcdefghijklmnopq', time: 10400 },
      { value: 'abcdefghijklmnopqr', time: 10600 },
      { value: 'abcdefghijklmnopqrs', time: 10900 },
      { value: 'abcdefghijklmnopqrst', time: 11600 },
    ];
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
    const RecorderPlayButton = controlButton('Play', IconNames.PLAY, () => {});
    const RecorderPauseButton = controlButton('Pause', IconNames.PAUSE, () => {});
    const RecorderStopButton = controlButton('Stop', IconNames.STOP, () => {});
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
    this.setState({
      duration: this.audio.current!.duration
    });
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
    this.mockData.forEach(data =>
      setTimeout(() => this.props.handleEditorValueChange(data.value), data.time)
    );
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
      currentPlayerProgress: currentTime / this.state.duration
    });
  };

  private handlePlayerProgressBarChange = (value: number) => {
    if (this.audio.current) {
      const currentTime = this.state.duration * value;
      this.audio.current.currentTime = currentTime;
      this.setState({
        currentPlayerTime: currentTime,
        currentPlayerProgress: value
      });
    }
  };

  private renderLabel = (value: number) => {
    const totalTime = this.state.duration * value;
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
  isPlaying: boolean;
}

export interface ISourcecastPlaybackControlbarState {
  currentPlayerTime: number;
  currentPlayerProgress: number;
  duration: number;
  isPlayerMode: boolean;
}

export default SourcecastPlaybackControlbar;
