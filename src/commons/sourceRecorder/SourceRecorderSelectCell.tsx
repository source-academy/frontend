import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sicp/sourceRecorder/SourceRecorderTypes';
import ControlButton from '../ControlButton';

type SourceRecorderSelectCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetSourcecastData: (
    title: string,
    description: string,
    uid: string,
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
      <Tooltip2 content="Load Sourcecast Recording">
        <ControlButton
          label={`${this.props.data.title}`}
          icon={IconNames.PAPERCLIP}
          onClick={this.handleSelect}
        />
      </Tooltip2>
    );
  }

  private handleSelect = () => {
    const { data } = this.props;
    this.props.handleSetSourcecastData(
      data.title,
      data.description,
      data.uid,
      data.url,
      JSON.parse(data.playbackData)
    );
  };
}

export default SourceRecorderSelectCell;
