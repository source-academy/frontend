/* tslint:disable:no-console */
import { Button, MenuItem, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { BACKEND_URL } from '../../utils/constants';
import { controlButton } from '../commons';
import {
  DeltaType,
  ICodeDelta,
  IPlaybackData,
  IPosition,
  ISourcecastData,
  PlaybackStatus
} from './sourcecastShape';

const SourcecastSelect = Select.ofType<ISourcecastData>();

const sourcecastPredicate: ItemPredicate<ISourcecastData> = (query, item) => {
  return item.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
};

const sourcecastRenderer: ItemRenderer<ISourcecastData> = (
  item,
  { handleClick, modifiers, query }
) => (
  <MenuItem active={false} key={item.id} onClick={handleClick} text={item.id + '. ' + item.name} />
);

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
    const LoadIndexButton = controlButton(
      'Load Index',
      IconNames.LIST,
      this.props.handleFetchSourcecastIndex
    );
    const PlayerPlayButton = controlButton('Play', IconNames.PLAY, this.handlePlayerPlaying);
    const PlayerPauseButton = controlButton('Pause', IconNames.PAUSE, this.handlePlayerPausing);
    const PlayerResumeButton = controlButton('Resume', IconNames.PLAY, this.handlePlayerResuming);
    return (
      <div>
        <audio
          src={this.props.audioUrl}
          ref={this.audio}
          // onEnded={this.handlePlayerStopping}
          onLoadedMetadata={this.handleAudioLoaded}
          onSeeked={this.handleSeeked}
          onTimeUpdate={this.updatePlayerTime}
          preload="metadata"
          // controls={true}
        />
        <br />
        <div>
          <div className="PlayerControl">
            {LoadIndexButton}
            {this.props.sourcecastIndex && (
              <SourcecastSelect
                className="pt-minimal"
                items={this.props.sourcecastIndex}
                onItemSelect={this.handleSelect}
                itemPredicate={sourcecastPredicate}
                itemRenderer={sourcecastRenderer}
                noResults={<MenuItem disabled={true} text="No recording matched" />}
                filterable={true}
              >
                <Button
                  className="pt-minimal"
                  text={
                    this.state.currentSourcecastItem
                      ? this.state.currentSourcecastItem.name
                      : 'No recording selected'
                  }
                  rightIcon="double-caret-vertical"
                />
              </SourcecastSelect>
            )}
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

  private handleSelect = (item: ISourcecastData, e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = BACKEND_URL + item.url;
    console.log(url);
    this.props.handleRecordAudioUrl(url);
    const playbackData = JSON.parse(item.deltas);
    console.log(playbackData);
    this.props.handleSetSourcecastData(playbackData);
    this.setState({ currentSourcecastItem: item });
  };

  private handleSeeked = () => {
    // FIXME: loop in applyPlaybackDataFromStart keeps running if seeked from paused mode
    this.stopPreviousPlaybackAndApplyFromStart(this.props.playbackData);
  };

  private handleAudioLoaded = () => {
    this.props.handleSetSourcecastDuration(this.audio.current!.duration);
  };

  private applyDeltas = (deltas: ICodeDelta[]) => {
    this.props.handleSetDeltasToApply(deltas);
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
    const deltasToApply = playbackData.deltas
      .filter(
        deltaWithTime =>
          deltaWithTime.time <= currentTime && deltaWithTime.type === DeltaType.codeDelta
      )
      .map(deltaWithTime => deltaWithTime.data as ICodeDelta);
    this.applyDeltas(deltasToApply);

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
        }
        i++;
        continue;
      }
      await sleep(50);
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
  handleFetchSourcecastIndex: () => void;
  handleRecordAudioUrl: (audioUrl: string) => void;
  handleSetDeltasToApply: (deltas: ICodeDelta[]) => void;
  handleSetEditorReadonly: (editorReadonly: boolean) => void;
  handleSetSourcecastData: (playbackData: IPlaybackData) => void;
  handleSetSourcecastDuration: (duration: number) => void;
  handleSetSourcecastStatus: (playbackStatus: PlaybackStatus) => void;
  handleUpdateEditorCursorPosition: (editorCursorPositionToBeApplied: IPosition) => void;
  audioUrl: string;
  duration: number;
  playbackData: IPlaybackData;
  playbackStatus: PlaybackStatus;
  sourcecastIndex: ISourcecastData[] | null;
}

export interface ISourcecastControlbarState {
  currentDeltaRevision: number;
  currentPlayerTime: number;
  currentPlayerProgress: number;
  currentSourcecastItem: ISourcecastData | null;
  duration: number;
}

export default SourcecastControlbar;
