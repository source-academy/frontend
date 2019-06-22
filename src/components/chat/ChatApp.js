import * as React from 'react';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import MessageList from './MessageList';
import Input from './Input';

export default class ChatApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }
  componentDidMount() {
    // tslint:disable-next-line:no-console
    /*
      TO MOVE instanceLocator and tokenProvider to backend

    */
    const chatManager = new ChatManager({
      instanceLocator: 'v1:us1:6fac6431-d3f3-4a32-b4e6-56a20bf6e500',
      tokenProvider: new TokenProvider({
        url:
          'https://us1.pusherplatform.io/services/chatkit_token_provider/v1/6fac6431-d3f3-4a32-b4e6-56a20bf6e500/token'
      }),
      userId: this.props.currentUserId
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
          roomId: this.props.currentRoomId

        });
      })
      .then(currentRoom => {
        this.setState({
          currentRoom
        });
      });
    this.scrollToBottom(); //for scrolling
  }

  addMessage(text) {
    this.state.currentUser.sendMessage({
      roomId: this.state.currentRoom.id,
      text
    });

  }

  render() {
    return (
      
      <div>
        <MessageList viewingUserId={this.state.currentUser.id} messages={this.state.messages} />
        <Input className="input-field" onSubmit={this.addMessage} > add something</Input>
          <div ref={this.messagesEndRef} />  
      </div>
    );
  }
}
