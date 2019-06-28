import * as React from 'react';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import MessageList from './MessageList.tsx';
import Input from './Input.tsx';
import { BACKEND_URL, INSTANCE_LOCATOR } from '../../utils/constants';
import { IState } from '../../reducers/states';
import jwt_decode from 'jwt-decode';

class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      hasError: false,
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

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  componentDidMount() {
    // If you are not working with the backend server running,
    // use the test token url, and hardcode the userId and roomId
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
          roomId: '19411521'
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
    this.state.currentUser.sendMessage({
      roomId: this.state.currentRoom.id,
      text
    });
  }

  render() {
    return this.state.connected & !this.state.hasError ? (
      <div className="chat">
        <MessageList
          className="message-list"
          viewingUserId={this.state.currentUser.id}
          messages={this.state.messages}
        />
        <Input className="input-field" onSubmit={this.addMessage} />
        <div ref={this.messagesEndRef} />
      </div>
    ) : (
      <p>
        <br />
        Trying to connect to the chat service..
        <br />
        If this is taking too long, check your Internet connection and reload.
      </p>
    );
  }
}

export default ChatApp;
