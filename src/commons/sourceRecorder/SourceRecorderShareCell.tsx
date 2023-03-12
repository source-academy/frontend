import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React, { useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import ControlButton from '../ControlButton';

type SourceRecorderShareCellProps = StateProps;

type StateProps = {
  data: SourcecastData;
  courseId?: number;
};

const SourceRecorderShareCell: React.FC<SourceRecorderShareCellProps> = props => {
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
      <Tooltip2 content="Copy link to clipboard">
        <CopyToClipboard text={shareURL}>
          <ControlButton icon={IconNames.DUPLICATE} onClick={selectShareInputText} />
        </CopyToClipboard>
      </Tooltip2>
    </div>
  );

  return (
    <Popover2
      popoverClassName="Popover-share"
      inheritDarkTheme={false}
      content={shareButtonPopoverContent}
    >
      <Tooltip2 content="Get shareable link">
        <ControlButton icon={IconNames.SHARE} />
      </Tooltip2>
    </Popover2>
  );
};

export default SourceRecorderShareCell;
