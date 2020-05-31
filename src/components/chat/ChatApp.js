// TODO: convert to TypeScript once this PR has been merged https://github.com/pusher/chatkit-client-js/pull/180
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import jwt_decode from 'jwt-decode';
import * as React from 'react';
import Input from './Input.tsx';
import MessageList from './MessageList.tsx';
import { BACKEND_URL, INSTANCE_LOCATOR } from '../../utils/constants';
import { IState } from '../../reducers/states';

const ConnectionStatus = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  FAILED_TO_CONNECT: 'failed_to_connect'
};

class ChatApp extends React.Component {
  messagesEndRef = React.createRef(); // for scrolling

  constructor(props) {
    super(props);
    this.state = {
      connectionStatus: ConnectionStatus.CONNECTING,
      currentRoom: {},
      currentUser: {},
      messages: []
    };
    this.addMessage = this.addMessage.bind(this);
  }

  componentDidMount() {
    let chatManager;
    try {
      chatManager = new ChatManager({
        instanceLocator: INSTANCE_LOCATOR,
        tokenProvider: new TokenProvider({
          headers: {
            Authorization: `Bearer ${this.props.accessToken}`
          },
          url: `${BACKEND_URL}/v1/chat/token`
        }),
        userId: jwt_decode(this.props.accessToken).sub
      });
    } catch (error) {
      this.setState({ connectionStatus: ConnectionStatus.FAILED_TO_CONNECT });
      return;
    }

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
          connectionStatus: ConnectionStatus.CONNECTED,
          currentRoom
        });
      })
      .catch(() => this.setState({ connectionStatus: ConnectionStatus.FAILED_TO_CONNECT }));
  }

  componentDidUpdate() {
    if (this.state.connectionStatus === ConnectionStatus.CONNECTED) {
      // ensure that most recent message is in view
      this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    switch (this.state.connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return (
          <div className="Chat">
            <MessageList
              messages={this.state.messages}
            />
            <hr />
            <Input onSubmit={this.addMessage} />
            <div ref={this.messagesEndRef} />
          </div>
        );
      case ConnectionStatus.CONNECTING:
        return (
          <span>
            Connecting to ChatKit...
            <br />
            If this is taking too long, refresh the page.
          </span>
        );
      case ConnectionStatus.FAILED_TO_CONNECT:
        return <span>Failed to connect. Try again later!</span>;
    }
  }
}

export default ChatApp;
