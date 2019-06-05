/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';

class SourcecastPlaybackControlbar extends
    React.PureComponent<ISourcecastPlaybackControlbarProps, ISourcecastPlaybackControlbarState> {
  private audio: React.RefObject<HTMLAudioElement>;

  constructor(props: ISourcecastPlaybackControlbarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentTime: 0,
      currentProgress: 0,
    };
  }

  public render() {
    const PlayButton = controlButton('Play', IconNames.PLAY, this.handlePlaying);
    const PauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePausing);
    const StopButton = controlButton('Stop', IconNames.STOP, this.handleStopping);
    return (
      <div>
        <audio
          src="http://www.amclassical.com/mp3/amclassical_beethoven_fur_elise.mp3"
          ref={this.audio}
          onTimeUpdate={this.updateTime}
          // controls={true}
        />
        <div className="Slider">
          <Slider
            min={0}
            max={1}
            stepSize={0.001}
            onChange={this.handleProgressBarChange}
            value={this.state.currentProgress}
            labelRenderer={this.renderLabel}
          />
        </div>
        <div className="PlayerControl">
          {PlayButton}
          {PauseButton}
          {StopButton}
        </div>
      </div>
    );
  }

  private handlePlaying = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.play();
    handleSetSourcecastPlaybackIsPlaying(true);
  };

  private handlePausing = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    handleSetSourcecastPlaybackIsPlaying(false);
  };

  private handleStopping = () => {
    const { handleSetSourcecastPlaybackIsPlaying } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    audio!.currentTime = 0;
    handleSetSourcecastPlaybackIsPlaying(false);
    this.setState({
      currentTime: 0,
      currentProgress: 0,
    });
  };

  private updateTime: React.ReactEventHandler<HTMLAudioElement> = (e) => {
    const { currentTime } : { currentTime: number } = e.target as HTMLMediaElement;
    this.setState({
      currentTime,
      currentProgress: currentTime / 211,
    });
  }

  private handleProgressBarChange = (value: number) => {
    if (this.audio.current) {
      const currentTime = 211 * value;
      this.audio.current.currentTime = currentTime;
      this.setState({
        currentTime,
        currentProgress: value,
      });
    }
  }

  private renderLabel = (value: number) => {
    const totalTime = 211 * value;
    const min = Math.floor(totalTime / 60);
    const sec = Math.floor(totalTime - min * 60);
    const minString = min < 10 ? '0' + min : min;
    const secString = sec < 10 ? '0' + sec : sec;
    return minString + ':' + secString;
  }
}

export interface ISourcecastPlaybackControlbarProps {
  handleSetSourcecastPlaybackIsPlaying: (isPlaying: boolean) => void;
  isPlaying: boolean;
}

export interface ISourcecastPlaybackControlbarState {
  currentTime: number;
  currentProgress: number;
}

export default SourcecastPlaybackControlbar;
