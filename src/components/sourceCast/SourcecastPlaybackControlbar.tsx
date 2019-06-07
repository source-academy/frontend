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
      duration: 0,
      isPlayerMode: true
    };
  }

  public render() {
    const PlayerPlayButton = controlButton('Play', IconNames.PLAY, this.handlePlayerPlaying);
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    const PlayerStopButton = controlButton('Stop', IconNames.STOP, this.handlePlayerStopping);
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
        <br />
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
      </div>
    );
  }

  private handleAudioLoaded = () => {
    this.props.handleSetSourcecastPlaybackDuration(this.audio.current!.duration);
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
}

export default SourcecastPlaybackControlbar;
