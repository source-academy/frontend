import { Popover, Text, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { controlButton } from '../../commons';

type ShareButtonState = {
  keyword: string;
};

export type ShareButtonProps = {
  handleGenerateLz?: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  queryString?: string;
  shortURL?: string;
  key: string;
};

export class ShareButton extends React.PureComponent<ShareButtonProps, ShareButtonState> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.shareInputElem = React.createRef();
    this.state = { keyword: '' };
  }

  public render() {
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
            {!this.props.shortURL ? (
              <div>
                <input placeholder={'Custom URL (optional)'} onChange={this.handleChange} />
                {controlButton('Get Link', IconNames.SHARE, () =>
                  this.props.handleShortenURL(this.state.keyword)
                )}
              </div>
            ) : (
              <div key={this.props.shortURL}>
                <input
                  defaultValue={this.props.shortURL}
                  readOnly={true}
                  ref={this.shareInputElem}
                />
                <Tooltip content="Copy link to clipboard">
                  <CopyToClipboard text={this.props.shortURL}>
                    {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
                  </CopyToClipboard>
                </Tooltip>
                {controlButton('Regen Link', IconNames.SHARE, () =>
                  this.props.handleUpdateShortURL('')
                )}
              </div>
            )}
          </>
        )}
      </Popover>
    );
  }

  private handleChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({ keyword: event.currentTarget.value });
  }

  private selectShareInputText() {
    if (this.shareInputElem.current !== null) {
      this.shareInputElem.current.focus();
      this.shareInputElem.current.select();
    }
  }
}
