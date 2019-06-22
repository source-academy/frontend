import React from 'react';
import { controlButton } from '../commons';

import { IconNames } from '@blueprintjs/icons';
import { Link } from 'react-router-dom';
import { Tooltip } from '@blueprintjs/core';


export default class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      message: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.message);
    this.setState({
      message: ''
    });
  }

  sendButtonOpts = {
    className: 'chat-send-button',
    fullWidth: true
  };

  render() {
    return (
      <div>
        <div style={{ padding: "0px 0px 5px 0px" }}>
          <textarea
            className="message-input"
            type="text"
            style={{

              backgroundColor: "",
              height: "90px",
              outline: "none",
              resize: "none",
              rows: "5",
              width: "100%",

            }}
            placeholder="Type your message here "
            onChange={this.handleChange}
            value={this.state.message} />
        </div>

        <Tooltip
          content={
            'hello'
          }
        >
          <a
            href={"https://www.markdownguide.org"}
            target={"_blank"}
            style={{ color: "inherit", fontStyle: "italic" }}
          >
            This chat uses Markdown. Click here to learn more about it.</a>
        </Tooltip>

        <div style={{ width: "100%" }}>
          {controlButton("Send", IconNames.PLAY, this.handleSubmit, this.sendButtonOpts)}
        </div>

      </div>

    );
  }
}
