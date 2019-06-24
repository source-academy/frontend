import * as React from 'react';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import MessageList from './MessageList';
import Input from './Input';
import { BACKEND_URL, INSTANCE_LOCATOR } from '../../utils/constants';
import { IState } from '../../reducers/states';
import jwt_decode from 'jwt-decode';

export default class ChatApp extends React.Component {
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
    this.scrollToBottom();
  } // for scrolling

  scrollToBottom = () => {
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

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
        this.setState({ currentUser, connected: true });
        return currentUser.subscribeToRoom({
          hooks: {
            onMessage: message => {
              this.setState({
                messages: [...this.state.messages, message]
              });
            }
          },
          messageLimit: 100,
          roomId: '19408932' // use roomId from your ChatKit instance
        });
      })
      .then(currentRoom => {
        this.setState({
          currentRoom
        });
      });
    if (this.state.connected) { this.scrollToBottom(); } //for scrolling
  }

  addMessage(text) {
    this.state.currentUser.sendMessage({
      roomId: this.state.currentRoom.id,
      text
    });
  }

  render() {
    return (
      this.state.connected 
      ? 
        <div>
            <MessageList viewingUserId={this.state.currentUser.id} messages={this.state.messages} />
            {this.state.currentRoom.id
              ? <Input className="input-field" onSubmit={this.addMessage} > add something</Input>
              : <p>Connected! Loading chat ... </p>
            }
          <div ref={this.messagesEndRef} />
        </div>
      : 
        <p>
          <br/>
          Trying to connect to the chat service ...
          <br/>
          If this is taking too long, check your Internet connection and reload.
        </p>
    );
  }
}
