/* tslint:disable:no-console */
import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import {
  DeltaType,
  ICodeDelta,
  IPlaybackData,
  IPosition,
  ISelectionData,
  ISourcecastData,
  PlaybackStatus
} from './sourcecastShape';

class SourcecastControlbar extends React.PureComponent<
  ISourcecastControlbarProps,
  ISourcecastControlbarState
> {
  private audio: React.RefObject<HTMLAudioElement>;

  constructor(props: ISourcecastControlbarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentDeltaRevision: 0,
      currentPlayerTime: 0,
      currentPlayerProgress: 0,
      currentSourcecastItem: null,
      duration: 0
    };
  }

  public render() {
    const PlayerPlayButton = controlButton('Play', IconNames.PLAY, this.handlePlayerPlaying);
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    const PlayerResumeButton = controlButton('Resume', IconNames.PLAY, this.handlePlayerResuming);
    return (
      <div>
        <audio
          src={this.props.audioUrl}
          ref={this.audio}
          onEnded={this.handlePlayerStopping}
          onLoadedMetadata={this.handleAudioLoaded}
          onSeeked={this.handleSeeked}
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
          </div>
        </div>
        <br />
      </div>
    );
  }

  private handleSeeked = () => {
    // FIXME: loop in applyPlaybackDataFromStart keeps running if seeked from paused mode
    this.stopPreviousPlaybackAndApplyFromStart(this.props.playbackData);
  };

  private handleAudioLoaded = () => {
    this.props.handleSetSourcecastDuration(this.audio.current!.duration);
  };

  private applyDeltas = (deltas: ICodeDelta[]) => {
    this.props.handleSetCodeDeltasToApply(deltas);
  };

  private stopPreviousPlaybackAndApplyFromStart = (playbackData: IPlaybackData) => {
    this.setState(
      {
        currentDeltaRevision: this.state.currentDeltaRevision + 1
      },
      () => this.applyPlaybackDataFromStart(playbackData)
    );
  };

  private applyPlaybackDataFromStart = async (playbackData: IPlaybackData) => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const currentRevision = this.state.currentDeltaRevision;
    let currentTime = this.audio.current!.currentTime * 1000;
    this.props.handleEditorValueChange(playbackData.init.editorValue);
    const codeDeltasToApply = playbackData.deltas
      .filter(
        deltaWithTime =>
          deltaWithTime.time <= currentTime && deltaWithTime.type === DeltaType.codeDelta
      )
      .map(deltaWithTime => deltaWithTime.data as ICodeDelta);
    this.applyDeltas(codeDeltasToApply);

    const futureData = playbackData.deltas.filter(
      deltaWithTime => deltaWithTime.time > currentTime
    );
    const len = futureData.length;
    let i = 0;
    while (i < len && this.state.currentDeltaRevision === currentRevision) {
      currentTime = this.audio.current!.currentTime * 1000;
      if (futureData[i].time < currentTime) {
        switch (futureData[i].type) {
          case DeltaType.codeDelta:
            this.applyDeltas([futureData[i].data as ICodeDelta]);
            break;
          case DeltaType.cursorPositionChange:
            this.props.handleUpdateEditorCursorPosition(futureData[i].data as IPosition);
            break;
          case DeltaType.selectionRangeData:
            this.props.handleUpdateEditorSelectionData(futureData[i].data as ISelectionData);
            break;
        }
        i++;
        continue;
      }
      await sleep(20);
    }
  };

  // // WE USE APPLY FROM START FOR ALL TIME SKIPPING OPERATIONS FIRST, THEN IMPLEMENT THIS TO IMPROVE EFFICIENCY
  // private applyPlaybackDataFromMiddle = (playbackData: IPlaybackData) => {
  //   const currentTime = this.audio.current!.currentTime * 1000;
  //   const playbackDataFiltered = playbackData.data.filter(data => data.time > currentTime);
  //   this.applyPlaybackDataFromStart({
  //     init: playbackData.init,
  //     data: playbackDataFiltered
  //   });
  // };

  private stopCurrentPlayback() {
    this.setState({
      currentDeltaRevision: this.state.currentDeltaRevision + 1
    });
  }

  private handlePlayerPlaying = () => {
    const audio = this.audio.current;
    audio!.play();
    this.props.handleSetEditorReadonly(true);
    this.props.handleEditorValueChange(this.props.playbackData.init.editorValue);
    this.props.handleSetSourcecastStatus(PlaybackStatus.playing);
    this.applyPlaybackDataFromStart(this.props.playbackData);
  };

  private handlePlayerPausing = () => {
    const audio = this.audio.current;
    audio!.pause();
    this.props.handleSetEditorReadonly(false);
    this.props.handleSetSourcecastStatus(PlaybackStatus.paused);
    this.stopCurrentPlayback();
  };

  private handlePlayerResuming = () => {
    const audio = this.audio.current;
    audio!.play();
    this.props.handleSetEditorReadonly(true);
    this.props.handleSetSourcecastStatus(PlaybackStatus.playing);
    this.stopPreviousPlaybackAndApplyFromStart(this.props.playbackData);
  };

  private handlePlayerStopping = () => {
    this.props.handleSetEditorReadonly(false);
    this.props.handleSetSourcecastStatus(PlaybackStatus.notStarted);
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

export interface ISourcecastControlbarProps {
  handleEditorValueChange: (newCode: string) => void;
  handleSetCodeDeltasToApply: (deltas: ICodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) => void;
  handleUpdateEditorCursorPosition: (editorCursorPositionToBeApplied: IPosition) => void;
  handleUpdateEditorSelectionData: (editorSelectionDataToBeApplied: ISelectionData) => void;
  audioUrl: string;
  duration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
}

export interface ISourcecastControlbarState {
  currentDeltaRevision: number;
  currentPlayerTime: number;
  currentPlayerProgress: number;
  currentSourcecastItem: ISourcecastData | null;
  duration: number;
}

export default SourcecastControlbar;
