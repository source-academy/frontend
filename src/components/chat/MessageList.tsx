import * as React from 'react';
import Markdown from '../commons/Markdown';
/*
  TO COLOR-CODE DIFFERENT ROLES
  White for students
  Blue for Avengers
  Green for Admins

*/

export type Message = {
  userStore: { users: { [x: string]: { name: React.ReactNode } } };
  senderId: React.ReactText;
  text: string;
};

export type StateProps = {
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
          {this.props.messages.map((message: Message, index: string | number | undefined) => (
            <li className="chat-message" style={this.messageStyle.msgItem} key={index}>
              <pre style={this.messageStyle.dialogueBox}>
                <p>{message.userStore.users[message.senderId].name} </p>
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
