import { Popover, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import controlButton from '../ControlButton';

type SourceRecorderShareCellProps = StateProps;

type StateProps = {
  data: SourcecastData;
};

type State = {
  shareURL: string;
};

class SourceRecorderShareCell extends React.Component<SourceRecorderShareCellProps, State> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  public constructor(props: SourceRecorderShareCellProps) {
    super(props);
    this.shareInputElem = React.createRef();
    this.selectShareInputText = this.selectShareInputText.bind(this);
    const url = `${window.location.protocol}//${window.location.host}/sourcecast/${props.data.uid}`;
    this.state = {
      shareURL: url
    };
  }

  public render() {
    return (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        <Tooltip content="Get shareable link">{controlButton('', IconNames.SHARE)}</Tooltip>
        <div key={this.state.shareURL}>
          <input defaultValue={this.state.shareURL} readOnly={true} ref={this.shareInputElem} />
          <Tooltip content="Copy link to clipboard">
            <CopyToClipboard text={this.state.shareURL}>
              {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
            </CopyToClipboard>
          </Tooltip>
        </div>
      </Popover>
    );
  }

  private selectShareInputText() {
    if (this.shareInputElem.current !== null) {
      this.shareInputElem.current.focus();
      this.shareInputElem.current.select();
    }
  }
}

export default SourceRecorderShareCell;
