import { NonIdealState, Popover, Spinner, Text, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import controlButton from '../ControlButton';

type ShareButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleGenerateLz?: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
};

type StateProps = {
  queryString?: string;
  shortURL?: string;
  key: string;
};

type State = {
  keyword: string;
  isLoading: boolean;
};

export class ShareButton extends React.PureComponent<ShareButtonProps, State> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
    this.shareInputElem = React.createRef();
    this.state = { keyword: '', isLoading: false };
  }

  public render() {
    return (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        <Tooltip content="Get shareable link">
          {controlButton('Share', IconNames.SHARE, () => this.toggleButton())}
        </Tooltip>
        {this.props.queryString === undefined ? (
          <Text>
            Share your programs! Type something into the editor (left), then click on this button
            again.
          </Text>
        ) : (
          <>
            {!this.props.shortURL || this.props.shortURL === 'ERROR' ? (
              !this.state.isLoading || this.props.shortURL === 'ERROR' ? (
                <div>
                  <input placeholder={'Custom Alias (optional)'} onChange={this.handleChange} />
                  {controlButton('Get Link', IconNames.SHARE, () => {
                    this.props.handleShortenURL(this.state.keyword);
                    this.setState({ isLoading: true });
                  })}
                </div>
              ) : (
                <div>
                  <NonIdealState
                    description="Generating Shareable Link..."
                    icon={<Spinner size={Spinner.SIZE_SMALL} />}
                  />
                </div>
              )
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
              </div>
            )}
          </>
        )}
      </Popover>
    );
  }

  public componentDidUpdate(prevProps: ShareButtonProps) {
    if (this.props.shortURL !== prevProps.shortURL) {
      this.setState({ keyword: '', isLoading: false });
    }
  }

  private toggleButton() {
    if (this.props.handleGenerateLz) {
      this.props.handleGenerateLz();
    }

    // reset state
    this.props.handleUpdateShortURL('');
    this.setState({ keyword: '', isLoading: false });
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
