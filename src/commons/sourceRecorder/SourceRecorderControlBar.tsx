import { Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SourcecastData
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import controlButton from '../ControlButton';

export type SourceRecorderControlBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorValueChange: (newCode: string) => void;
  handleSetCurrentPlayerTime: (playTime: number) => void;
  handleSetCodeDeltasToApply: (deltas: CodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetInputToApply: (inputToApply: Input) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) => void;
  handleChapterSelect: (chapter: number) => void;
  handleExternalSelect: (name: ExternalLibraryName) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
};

type StateProps = {
  audioUrl: string;
  currentPlayerTime: number;
  duration: number;
  playbackData: PlaybackData;
  playbackStatus: PlaybackStatus;
};

type State = {
  currentDeltaRevision: number;
  currentPlayerProgress: number;
  currentSourcecastItem: SourcecastData | null;
  duration: number;
};

class SourceRecorderControlBar extends React.PureComponent<SourceRecorderControlBarProps, State> {
  private audio: React.RefObject<HTMLAudioElement>;

  constructor(props: SourceRecorderControlBarProps) {
    super(props);
    this.audio = React.createRef();
    this.state = {
      currentDeltaRevision: 0,
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

  private applyDeltas = (deltas: CodeDelta[]) => {
    this.props.handleSetCodeDeltasToApply(deltas);
  };

  private stopPreviousPlaybackAndApplyFromStart = (playbackData: PlaybackData) => {
    this.setState(
      {
        currentDeltaRevision: this.state.currentDeltaRevision + 1
      },
      () => this.applyPlaybackDataFromStart(playbackData)
    );
  };

  private applyPlaybackDataFromStart = async (playbackData: PlaybackData) => {
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
      .map(deltaWithTime => deltaWithTime.data as CodeDelta);
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
    this.props.handleSetCurrentPlayerTime(0);
    this.setState({
      currentPlayerProgress: 0
    });
  };

  private updatePlayerTime: React.ReactEventHandler<HTMLAudioElement> = e => {
    const { currentTime }: { currentTime: number } = e.target as HTMLMediaElement;
    this.props.handleSetCurrentPlayerTime(currentTime);
    this.setState({
      currentPlayerProgress: currentTime / this.props.duration
    });
  };

  private handlePlayerProgressBarChange = (value: number) => {
    if (this.audio.current) {
      const currentTime = this.props.duration * value;
      this.audio.current.currentTime = currentTime;
      this.props.handleSetCurrentPlayerTime(currentTime);
      this.setState({
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

export default SourceRecorderControlBar;
