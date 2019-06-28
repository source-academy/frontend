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
  // TODO: consolidate styles in scss file
  private messageStyle = {
    dialogueBox: {
      fontFamily: 'inherit',
      padding: '9px 15px 8px 15px'
    },

    msgItem: {
      listStyleType: 'none'
    },

    msgList: {
      padding: '0px 0px 5px 0px'
    },

    sender: {
      fontWeight: 'bold',
      margin: '0px 0px 6px 0px'
    }
  };

  public render() {
    return (
      <div>
        <ul className="message-list" style={this.messageStyle.msgList}>
          {this.props.messages.map((message: Message, index: number) => (
            <li className="chat-message" style={this.messageStyle.msgItem} key={index}>
              <pre style={this.messageStyle.dialogueBox}>
                <span>
                  <strong>{message.userStore.users[message.senderId].name}</strong>
                  &emsp;
                  <i>{getPrettyDate(message.createdAt)}</i>
                </span>
                <Markdown content={message.text} />
              </pre>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default MessageList;
