/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';

class SourcecastPlaybackControlbar extends React.PureComponent<
  ISourcecastPlaybackControlbarProps,
  ISourcecastPlaybackControlbarState
> {
  private audio: React.RefObject<HTMLAudioElement>;

  constructor(props: ISourcecastPlaybackControlbarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentPlayerTime: 0,
      currentPlayerProgress: 0,
      isPlayerMode: true
    };
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
          src="http://www.amclassical.com/mp3/amclassical_beethoven_fur_elise.mp3"
          ref={this.audio}
          onTimeUpdate={this.updatePlayerTime}
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
  };

  private handlePlayerPausing = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    handleSetSourcecastPlaybackIsPlaying(false);
  };

  private handlePlayerStopping = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    audio!.currentTime = 0;
    handleSetSourcecastPlaybackIsPlaying(false);
    this.setState({
      currentPlayerTime: 0,
      currentPlayerProgress: 0
    });
  };

  private updatePlayerTime: React.ReactEventHandler<HTMLAudioElement> = e => {
    const { currentTime }: { currentTime: number } = e.target as HTMLMediaElement;
    this.setState({
      currentPlayerTime: currentTime,
      currentPlayerProgress: currentTime / 211
    });
  };

  private handlePlayerProgressBarChange = (value: number) => {
    if (this.audio.current) {
      const currentTime = 211 * value;
      this.audio.current.currentTime = currentTime;
      this.setState({
        currentPlayerTime: currentTime,
        currentPlayerProgress: value
      });
    }
  };

  private renderLabel = (value: number) => {
    const totalTime = 211 * value;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  };
}

export interface ISourcecastPlaybackControlbarProps {
  handleEditorValueChange: (newCode: string) => void;
  handleSetSourcecastPlaybackIsPlaying: (isPlaying: boolean) => void;
  isPlaying: boolean;
}

export interface ISourcecastPlaybackControlbarState {
  currentPlayerTime: number;
  currentPlayerProgress: number;
  isPlayerMode: boolean;
}

export default SourcecastPlaybackControlbar;
