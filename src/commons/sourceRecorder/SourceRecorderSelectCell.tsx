import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import controlButton from '../ControlButton';

type SourceRecorderSelectCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetSourcecastData: (
    title: string,
    description: string,
    audioUrl: string,
    playbackData: PlaybackData
  ) => void;
};

type StateProps = {
  data: SourcecastData;
};

class SourceRecorderSelectCell extends React.Component<SourceRecorderSelectCellProps, {}> {
  public constructor(props: SourceRecorderSelectCellProps) {
    super(props);
  }

  public render() {
    return (
      <div>{controlButton(`${this.props.data.title}`, IconNames.PLAY, this.handleSelect)}</div>
    );
  }

  private handleSelect = () => {
    const { data } = this.props;
    const url = data.url;
    const playbackData = JSON.parse(data.playbackData);
    this.props.handleSetSourcecastData(data.title, data.description, url, playbackData);
  };
}

export default SourceRecorderSelectCell;
