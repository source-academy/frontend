/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { IDelta, IPlaybackData, PlaybackStatus } from './sourcecastShape';

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
      duration: 0
    };
  }

  public render() {
    const PlayerPlayButton = controlButton('Play', IconNames.PLAY, this.handlePlayerPlaying);
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    const PlayerResumeButton = controlButton('Resume', IconNames.PLAY, this.handlePlayerResuming);
    const PlayerStopButton = controlButton('Stop', IconNames.STOP, this.handlePlayerStopping);
    return (
      <div>
        <audio
          src="https://www.salamisound.com/stream_file/49003902987136547878968146"
          ref={this.audio}
          onEnded={this.handlePlayerStopping}
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
              stepSize={0.0001}
              onChange={this.handlePlayerProgressBarChange}
              value={this.state.currentPlayerProgress}
              labelRenderer={this.renderLabel}
            />
          </div>
          <div className="PlayerControl">
            {this.props.playbackStatus === PlaybackStatus.notStarted && PlayerPlayButton}
            {this.props.playbackStatus === PlaybackStatus.playing && PlayerPauseButton}
            {this.props.playbackStatus === PlaybackStatus.paused && PlayerResumeButton}
            {this.props.playbackStatus === PlaybackStatus.paused && PlayerStopButton}
          </div>
        </div>
        <br />
      </div>
    );
  }

  private handleAudioLoaded = () => {
    this.props.handleSetSourcecastPlaybackDuration(this.audio.current!.duration);
    // DO NOT KEEP THE CODE BELOW!!!
    // IT'S JUST A TEMPORARY SOLUTION TO SET INITIAL EDITOR VALUE FOR THE DEMO!!!
  };

  private applyDelta = (delta: IDelta) => {
    this.props.handleSetDeltaToApply(delta);
  };

  private applyPlaybackDataFromStart = async (playbackData: IPlaybackData) => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const len = playbackData.data.length;
    const data = this.props.playbackData.data;
    let i = 0;
    while (i < len) {
      const currentTime = this.audio.current!.currentTime * 1000;
      if (data[i].time < currentTime) {
        this.applyDelta(data[i].delta);
        i++;
        continue;
      }
      await sleep(10);
    }
  };

  private applyPlaybackDataFromMiddle = (playbackData: IPlaybackData) => {
    const currentTime = this.audio.current!.currentTime * 1000;
    const playbackDataFiltered = playbackData.data.filter(data => data.time > currentTime);
    this.applyPlaybackDataFromStart({
      init: playbackData.init,
      data: playbackDataFiltered
    });
  };

  private handlePlayerPlaying = () => {
    const { handleSetSourcecastPlaybackStatus } = this.props;
    const audio = this.audio.current;
    audio!.play();
    this.props.handleSetEditorReadonly(true);
    this.props.handleEditorValueChange(this.props.playbackData.init);
    handleSetSourcecastPlaybackStatus(PlaybackStatus.playing);
    this.applyPlaybackDataFromStart(this.props.playbackData);
  };

  private handlePlayerPausing = () => {
    const { handleSetSourcecastPlaybackStatus } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    this.props.handleSetEditorReadonly(false);
    handleSetSourcecastPlaybackStatus(PlaybackStatus.paused);
  };

  private handlePlayerResuming = () => {
    const { handleSetSourcecastPlaybackStatus } = this.props;
    const audio = this.audio.current;
    audio!.play();
    this.props.handleSetEditorReadonly(true);
    handleSetSourcecastPlaybackStatus(PlaybackStatus.playing);
    this.applyPlaybackDataFromMiddle(this.props.playbackData);
  };

  private handlePlayerStopping = () => {
    const { handleSetSourcecastPlaybackStatus } = this.props;
    const audio = this.audio.current;
    audio!.pause();
    audio!.currentTime = 0;
    handleSetSourcecastPlaybackStatus(PlaybackStatus.notStarted);
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
  handleSetDeltaToApply: (delta: IDelta) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetSourcecastPlaybackDuration: (duration: number) => void;
  handleSetSourcecastPlaybackStatus: (playbackStatus: PlaybackStatus) => void;
  duration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
}

export interface ISourcecastPlaybackControlbarState {
  currentPlayerTime: number;
  currentPlayerProgress: number;
  duration: number;
}

export default SourcecastPlaybackControlbar;
