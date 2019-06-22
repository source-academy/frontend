import * as React from 'react';
import Markdown from '../commons/Markdown';
import { alignmentClass } from '@blueprintjs/core/lib/esm/common/classes';
/*
  TO COLOR-CODE DIFFERENT ROLES
  White for students
  Blue for Avengers
  Green for Admins

*/

export default class MessageList extends React.Component {


  messageStyle = {
    dialogueBox: {
      fontFamily: "inherit",
      padding: "9px 15px 8px 15px"
    },

    msgItem: {
      listStyleType: "none"
    },

    msgList: {
      padding: "0px 0px 5px 0px"
    },

    sender: {
      fontWeight: "bold",
      margin: "0px 0px 6px 0px"
    }
  };

  render() {
    return (
      <div>
        <ul className="message-list" style={this.messageStyle.msgList} >
          {this.props.messages.map((message, index) => (
            <li className="chat-message" style={this.messageStyle.msgItem} key={index}>
              <pre style={this.messageStyle.dialogueBox}>
                <p style={this.messageStyle.sender} >{message.userStore.users[message.senderId].name} </p>
                <Markdown content={message.text} />
              </pre>
            </li>
          ))}
        </ul>
      </div>

    );
  }
}
