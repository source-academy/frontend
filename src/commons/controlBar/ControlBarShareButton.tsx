import { NonIdealState, Position, Spinner, SpinnerSize, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import ControlButton from '../ControlButton';
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
  isSicp?: boolean;
  programConfig: object;
};

type State = {
  keyword: string;
  isLoading: boolean;
  isSuccess: boolean;
};

export class ControlBarShareButton extends React.PureComponent<ControlBarShareButtonProps, State> {
  private shareInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarShareButtonProps) {
    super(props);
    this.selectShareInputText = this.selectShareInputText.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
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
      // console.log('Ctrl+Enter pressed!');
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
                <>{console.log(this.props.programConfig)}</>
                <ControlButton
                  label="Get Link"
                  icon={IconNames.SHARE}
                  onClick={() => {
                    // post request to backend, set keyword as return uuid
                    const requestBody = {
                      shared_program: {
                        data: this.props.programConfig
                      }
                    };
                    const fetchOpts: RequestInit = {
                      method: 'POST',
                      body: JSON.stringify(requestBody),
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    };
                    fetch('http://localhost:4000/api/shared_programs', fetchOpts)
                      .then(res => {
                        return res.json();
                      })
                      .then(resp => {
                        this.setState({ keyword: resp.uuid });
                        console.log(resp);
                      })
                      .catch(err => console.log('Error: ', err));
                    this.setState({ isLoading: true, isSuccess: true });
                  }}
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
            // <div key={this.props.shortURL}>
            <div key={this.state.keyword}>
              {/* <input defaultValue={this.props.shortURL} readOnly={true} ref={this.shareInputElem} /> */}
              <input defaultValue={this.state.keyword} readOnly={true} ref={this.shareInputElem} />
              <Tooltip2 content="Copy link to clipboard">
                {/* <CopyToClipboard text={this.props.shortURL}> */}
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
    // this.props.handleUpdateShortURL('');
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
}
