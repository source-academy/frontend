import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { ExternalLibraryName } from '../assessment/assessmentShape';
import { controlButton } from '../commons';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
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
    const PlayerPlayButton = controlButton(
      'Play',
      IconNames.PLAY,
      this.handlePlayerPlaying,
      {},
      !this.props.duration
    );
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    return (
      <div className="Bar">
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
          <div className="PlayerControl">
            <div className="PlayerControl">
              {this.props.playbackStatus === PlaybackStatus.paused && PlayerPlayButton}
              {this.props.playbackStatus === PlaybackStatus.playing && PlayerPauseButton}
            </div>
          </div>
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
    this.props.handleExternalSelect(playbackData.init.externalLibrary);
    this.props.handleChapterSelect(playbackData.init.chapter);
    const codeDeltasToApply = playbackData.inputs
      .filter(
        deltaWithTime => deltaWithTime.time <= currentTime && deltaWithTime.type === 'codeDelta'
      )
      .map(deltaWithTime => deltaWithTime.data as ICodeDelta);
    this.applyDeltas(codeDeltasToApply);

    const futureData = playbackData.inputs.filter(
      deltaWithTime => deltaWithTime.time > currentTime
    );
    const len = futureData.length;
    let i = 0;
    while (i < len && this.state.currentDeltaRevision === currentRevision) {
      currentTime = this.audio.current!.currentTime * 1000;
      if (futureData[i].time < currentTime) {
        this.props.handleSetInputToApply(futureData[i]);
        i++;
        continue;
      }
      await sleep(20);
    }
  };

  private stopCurrentPlayback() {
    this.setState({
      currentDeltaRevision: this.state.currentDeltaRevision + 1
    });
  }

  private handlePlayerPausing = () => {
    const audio = this.audio.current;
    audio!.pause();
    this.props.handleSetEditorReadonly(false);
    this.props.handleSetSourcecastStatus(PlaybackStatus.paused);
    this.stopCurrentPlayback();
  };

  private handlePlayerPlaying = () => {
    const audio = this.audio.current;
    audio!.play();
    this.props.handleSetEditorReadonly(true);
    this.props.handleSetSourcecastStatus(PlaybackStatus.playing);
    this.stopPreviousPlaybackAndApplyFromStart(this.props.playbackData);
  };

  private handlePlayerStopping = () => {
    this.props.handleSetEditorReadonly(false);
    this.props.handleSetSourcecastStatus(PlaybackStatus.paused);
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
    if (this.props.duration) {
      const totalTime = this.props.duration * value;
      const min = Math.floor(totalTime / 60);
      const sec = Math.floor(totalTime - min * 60);
      const minString = min < 10 ? '0' + min : min;
      const secString = sec < 10 ? '0' + sec : sec;
      return minString + ':' + secString;
    } else {
      return '00:00';
    }
  };
}

export interface ISourcecastControlbarProps {
  handleEditorValueChange: (newCode: string) => void;
  handleSetCodeDeltasToApply: (deltas: ICodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetInputToApply: (inputToApply: Input) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) => void;
  audioUrl: string;
  duration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
  handleChapterSelect: (chapter: number) => void;
  handleExternalSelect: (name: ExternalLibraryName) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
}

export interface ISourcecastControlbarState {
  currentDeltaRevision: number;
  currentPlayerTime: number;
  currentPlayerProgress: number;
  currentSourcecastItem: ISourcecastData | null;
  duration: number;
}

export default SourcecastControlbar;
