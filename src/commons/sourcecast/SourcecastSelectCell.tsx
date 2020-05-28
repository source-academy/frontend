import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sourcecast/SourcecastTypes';
import controlButton from '../ControlButton';

type SelectCellProps = DispatchProps & StateProps;

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

class SourcecastSelectCell extends React.Component<SelectCellProps, {}> {
  public constructor(props: SelectCellProps) {
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

export default SourcecastSelectCell;
