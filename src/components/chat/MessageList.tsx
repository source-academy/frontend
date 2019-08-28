import { Classes, Pre } from '@blueprintjs/core';
import * as React from 'react';

import { getPrettyDate } from '../../utils/dateHelpers';
import Markdown from '../commons/Markdown';

type Message = {
  userStore: { users: { [x: string]: { name: string } } };
  senderId: React.ReactText;
  text: string;
  createdAt: string;
};

type StateProps = {
  messages: Message[];
};

class MessageList extends React.Component<StateProps> {
  public render() {
    return (
      <div>
        <ul className="msg-list">
          {this.props.messages.length > 0 ? (
            this.props.messages.map((message: Message, index: number) => (
              <li className="msg-item" key={index}>
                <Pre className="dialogue-box">
                  <span>
                    <strong className="msg-sender">
                      {message.userStore.users[message.senderId].name}
                    </strong>
                    &emsp;
                    <i className="msg-date">{getPrettyDate(message.createdAt)}</i>
                  </span>
                  <Markdown className={Classes.RUNNING_TEXT} content={message.text} />
                </Pre>
              </li>
            ))
          ) : (
            <li className="msg-item" key="no-message">
              <Pre className="dialogue-box">
                <span>There are no messages.</span>
              </Pre>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default MessageList;
