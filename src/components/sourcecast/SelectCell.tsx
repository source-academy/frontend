import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';
import { IPlaybackData, ISourcecastData } from './sourcecastShape';

interface ISelectCellProps {
  data: ISourcecastData;
  handleSetSourcecastData: (
    title: string,
    description: string,
    audioUrl: string,
    playbackData: IPlaybackData
  ) => void;
}

class SelectCell extends React.Component<ISelectCellProps, {}> {
  public constructor(props: ISelectCellProps) {
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

export default SelectCell;
