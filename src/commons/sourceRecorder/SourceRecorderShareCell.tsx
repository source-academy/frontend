import { Popover, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import ControlButton from '../ControlButton';

type Props = {
  data: SourcecastData;
  courseId?: number;
};

const SourceRecorderShareCell: React.FC<Props> = props => {
  const shareInputElem = useRef<HTMLInputElement>(null);
  const [shareURL] = useState<string>(
    `${window.location.protocol}//${window.location.host}/courses/${props.courseId}/sourcecast/${props.data.uid}`
  );

  const selectShareInputText = () => {
    if (shareInputElem.current !== null) {
      shareInputElem.current.focus();
      shareInputElem.current.select();
    }
  };

  const shareButtonPopoverContent = (
    <div key={shareURL}>
      <input defaultValue={shareURL} readOnly={true} ref={shareInputElem} />
      <Tooltip content="Copy link to clipboard">
        <CopyToClipboard text={shareURL}>
          <ControlButton icon={IconNames.DUPLICATE} onClick={selectShareInputText} />
        </CopyToClipboard>
      </Tooltip>
    </div>
  );

  return (
    <Popover
      popoverClassName="Popover-share"
      inheritDarkTheme={false}
      content={shareButtonPopoverContent}
    >
      <Tooltip content="Get shareable link">
        <ControlButton icon={IconNames.SHARE} />
      </Tooltip>
    </Popover>
  );
};

export default SourceRecorderShareCell;
