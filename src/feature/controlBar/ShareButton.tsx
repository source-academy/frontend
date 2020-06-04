import { Popover, Text, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import controlButton from '../../commons/ControlButton';

export type ShareButtonProps = {
  handleGenerateLz?: () => void;
  queryString?: string;
  key: string;
};

export class ShareButton extends React.PureComponent<ShareButtonProps, {}> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.shareInputElem = React.createRef();
  }

  public render() {
    const shareUrl = `${window.location.protocol}//${window.location.hostname}/playground#${this.props.queryString}`;

    return (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        <Tooltip content="Get shareable link">
          {controlButton('Share', IconNames.SHARE, this.props.handleGenerateLz)}
        </Tooltip>
        {this.props.queryString === undefined ? (
          <Text>
            Share your programs! Type something into the editor (left), then click on this button
            again.
          </Text>
        ) : (
          <>
            <input defaultValue={shareUrl} readOnly={true} ref={this.shareInputElem} />
            <Tooltip content="Copy link to clipboard">
              <CopyToClipboard text={shareUrl}>
                {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
              </CopyToClipboard>
            </Tooltip>
          </>
        )}
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
