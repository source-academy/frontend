import { NonIdealState, Position, Spinner, SpinnerSize, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import ShareLinkState from 'src/features/playground/shareLinks/ShareLinkState';

import ControlButton from '../ControlButton';
import Constants from '../utils/Constants';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { request } from '../utils/RequestHelper';
import { RemoveLast } from '../utils/TypeHelper';

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
  isSicp?: boolean;
  programConfig: ShareLinkState;
  token: Tokens;
};

type State = {
  keyword: string;
  isLoading: boolean;
  isSuccess: boolean;
};

type ShareLinkRequestHelperParams = RemoveLast<Parameters<typeof request>>;

export type Tokens = {
  accessToken: string | undefined;
  refreshToken: string | undefined;
};

export const requestToShareProgram = async (
  ...[path, method, opts]: ShareLinkRequestHelperParams
) => {
  const resp = await request(path, method, opts);
  return resp;
};

export class ControlBarShareButton extends React.PureComponent<ControlBarShareButtonProps, State> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
    this.fetchUUID = this.fetchUUID.bind(this);
    this.shareInputElem = React.createRef();
    this.state = { keyword: '', isLoading: false, isSuccess: false };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      // press Ctrl+Enter to generate and copy new share link directly
      this.setState({ keyword: 'Test' });
      this.props.handleShortenURL(this.state.keyword);
      this.setState({ isLoading: true });
      if (this.props.shortURL || this.props.isSicp) {
        this.selectShareInputText();
        console.log('link created.');
      }
    }
  };

  public render() {
    const shareButtonPopoverContent =
      this.props.queryString === undefined ? (
        <Text>
          Share your programs! Type something into the editor (left), then click on this button
          again.
        </Text>
      ) : this.props.isSicp ? (
        <div>
          <input defaultValue={this.props.queryString!} readOnly={true} ref={this.shareInputElem} />
          <Tooltip2 content="Copy link to clipboard">
            <CopyToClipboard text={this.props.queryString!}>
              <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectShareInputText} />
            </CopyToClipboard>
          </Tooltip2>
        </div>
      ) : (
        <>
          {!this.state.isSuccess || this.props.shortURL === 'ERROR' ? (
            !this.state.isLoading || this.props.shortURL === 'ERROR' ? (
              <div>
                {Constants.urlShortenerBase}&nbsp;
                <input
                  placeholder={'custom string (optional)'}
                  onChange={this.handleChange}
                  style={{ width: 175 }}
                />
                <ControlButton
                  label="Get Link"
                  icon={IconNames.SHARE}
                  // post request to backend, set keyword as return uuid
                  onClick={() => this.fetchUUID(this.props.token)}
                />
              </div>
            ) : (
              <div>
                <NonIdealState
                  description="Generating Shareable Link..."
                  icon={<Spinner size={SpinnerSize.SMALL} />}
                />
              </div>
            )
          ) : (
            <div key={this.state.keyword}>
              <input defaultValue={this.state.keyword} readOnly={true} ref={this.shareInputElem} />
              <Tooltip2 content="Copy link to clipboard">
                <CopyToClipboard text={this.state.keyword}>
                  <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectShareInputText} />
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
          <ControlButton label="Share" icon={IconNames.SHARE} onClick={() => this.toggleButton()} />
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
    this.setState({ keyword: '', isLoading: false, isSuccess: false });
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

  private fetchUUID(tokens: Tokens) {
    const requestBody = {
      shared_program: {
        data: this.props.programConfig
      }
    };

    const getProgramUrl = async () => {
      const resp = await requestToShareProgram(`shared_programs`, 'POST', {
        body: requestBody,
        ...tokens
      });
      if (!resp) {
        return showWarningMessage('Fail to generate url!');
      }
      const respJson = await resp.json();
      this.setState({
        keyword: `${window.location.host}/playground/share/` + respJson.uuid
      });
      this.setState({ isLoading: true, isSuccess: true });
      return;
    };

    getProgramUrl();
  }
}
