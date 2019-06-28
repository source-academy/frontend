import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { controlButton } from '../commons';

type StateProps = {
  message: string;
};

interface InputProps {
  onSubmit: (text: string) => void;
}

class Input extends React.Component<InputProps, StateProps> {
  public constructor(props: InputProps) {
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

    // TODO: move styling out into scss
    const inputStyle = {
      padding: { padding: '0px 0px 5px 0px' },
      textarea: {
        height: '90px',
        outline: 'none',
        width: '100%'
      },
      link: { color: 'inherit' }
    };

    return (
      <div>
        <div style={inputStyle.padding}>
          <textarea
            className="message-input"
            style={inputStyle.textarea}
            placeholder="Type your message here"
            onChange={this.handleChange}
            value={this.state.message}
          />
        </div>
        <a href="https://www.markdownguide.org" target="_blank" style={inputStyle.link}>
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
