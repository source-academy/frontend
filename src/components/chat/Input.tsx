import { TextArea } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';

type StateProps = {
  message: string;
};

interface IInputProps {
  onSubmit: (text: string) => void;
}

class Input extends React.Component<IInputProps, StateProps> {
  public constructor(props: IInputProps) {
    super(props);
    this.state = {
      message: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public render() {
    const sendButtonOpts = {
      className: 'chat-send-button',
      fullWidth: true
    };

    return (
      <div>
        <div className="input-zone">
          <TextArea
            className="input-msg"
            placeholder="Type your message here"
            onChange={this.handleChange}
            value={this.state.message}
          />
        </div>
        <a href="https://www.markdownguide.org" target="_blank" className="markdown-link">
          This chat uses Markdown. Click here to learn more.
        </a>
        {controlButton('Send', IconNames.PLAY, this.handleSubmit, sendButtonOpts)}
      </div>
    );
  }

  private handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({
      message: e.target.value
    });
  }

  private handleSubmit() {
    this.props.onSubmit(this.state.message);
    this.setState({
      message: ''
    });
  }
}

export default Input;
