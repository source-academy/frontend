import { NonIdealState, Position, Spinner, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import controlButton from '../ControlButton';
import Constants from '../utils/Constants';

type ControlBarShareButtonProps = DispatchProps & StateProps;

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

export class ControlBarShareButton extends React.PureComponent<ControlBarShareButtonProps, State> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
    this.shareInputElem = React.createRef();
    this.state = { keyword: '', isLoading: false };
  }

  public render() {
    let url = '';
    const { urlShortener } = Constants;
    if (urlShortener) {
      url = urlShortener.split('/').slice(0, -1).join('/') + '/';
    }

    const shareButtonPopoverContent =
      this.props.queryString === undefined ? (
        <Text>
          Share your programs! Type something into the editor (left), then click on this button
          again.
        </Text>
      ) : (
        <>
          {!this.props.shortURL || this.props.shortURL === 'ERROR' ? (
            !this.state.isLoading || this.props.shortURL === 'ERROR' ? (
              <div>
                {url}&nbsp;
                <input
                  placeholder={'custom string (optional)'}
                  onChange={this.handleChange}
                  style={{ width: 175 }}
                />
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
              <input defaultValue={this.props.shortURL} readOnly={true} ref={this.shareInputElem} />
              <Tooltip2 content="Copy link to clipboard">
                <CopyToClipboard text={this.props.shortURL}>
                  {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
                </CopyToClipboard>
              </Tooltip2>
            </div>
          )}
        </>
      );

    return (
      <Popover2
        popoverClassName="Popover-share"
        inheritDarkTheme={false}
        content={shareButtonPopoverContent}
      >
        <Tooltip2 content="Get shareable link" placement={Position.TOP}>
          {controlButton('Share', IconNames.SHARE, () => this.toggleButton())}
        </Tooltip2>
      </Popover2>
    );
  }

  public componentDidUpdate(prevProps: ControlBarShareButtonProps) {
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
