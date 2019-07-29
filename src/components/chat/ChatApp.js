// TODO: convert to TypeScript once this PR has been merged https://github.com/pusher/chatkit-client-js/pull/180
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import jwt_decode from 'jwt-decode';
import * as React from 'react';
import Input from './Input.tsx';
import MessageList from './MessageList.tsx';
import { BACKEND_URL, INSTANCE_LOCATOR } from '../../utils/constants';
import { IState } from '../../reducers/states';

class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      currentRoom: {},
      currentUser: {},
      messages: []
    };
    this.addMessage = this.addMessage.bind(this);
  }
  /*
  To keep the chat view at its bottom (and also where the input field is) we create a dummy div at the bottom.
  It will be automatically rendered and scrolled to everytime the chat is updated.
  */
  messagesEndRef = React.createRef(); // for scrolling

  componentDidUpdate() {
    if (this.state.connected) {
      this.scrollToBottom();
    }
  } // for scrolling

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  componentDidMount() {
    const chatManager = new ChatManager({
      instanceLocator: INSTANCE_LOCATOR,
      tokenProvider: new TokenProvider({
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`
        },
        url: `${BACKEND_URL}/v1/chat/token`
      }),
      userId: jwt_decode(this.props.accessToken).sub
    });

    chatManager
      .connect()
      .then(currentUser => {
        this.setState({ currentUser });
        return currentUser.subscribeToRoom({
          hooks: {
            onMessage: message => {
              this.setState({
                messages: [...this.state.messages, message]
              });
            }
          },
          messageLimit: 100,
          roomId: this.props.roomId
        });
      })
      .then(currentRoom => {
        this.setState({
          connected: true,
          currentRoom
        });
      });

    if (this.state.connected) {
      this.scrollToBottom();
    } //for scrolling
  }

  addMessage(text) {
    if (text.length === 0) {
      return;
    }
    
    this.state.currentUser.sendMessage({
      roomId: this.state.currentRoom.id,
      text
    });

    this.props.handleNotifyUsers(this.props.assessmentId, this.props.submissionId);
  }

  render() {
    return this.state.connected ? (
      <div className="chat">
        <MessageList
          className="message-list"
          viewingUserId={this.state.currentUser.id}
          messages={this.state.messages}
        />
        <hr />
        <Input className="input-field" onSubmit={this.addMessage} />
        <div ref={this.messagesEndRef} />
      </div>
    ) : (
      <span>
        Connecting to ChatKit...
        <br />
        If this is taking too long, refresh the page.
      </span>
    );
  }
}

export default ChatApp;
