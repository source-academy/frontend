import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
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
const SourceRecorderSelectCell: React.FC<SourceRecorderSelectCellProps> = ({
  data,
  handleSetSourcecastData
}) => {
  const handleSelect = () => {
    handleSetSourcecastData(
      data.title,
      data.description,
      data.uid,
      data.url,
      JSON.parse(data.playbackData)
    );
  };

  return (
    <Tooltip content="Load Sourcecast Recording">
      <ControlButton label={`${data.title}`} icon={IconNames.PAPERCLIP} onClick={handleSelect} />
    </Tooltip>
  );
};

export default SourceRecorderSelectCell;
