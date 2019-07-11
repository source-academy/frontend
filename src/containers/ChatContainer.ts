import { connect, MapStateToProps } from 'react-redux';

import ChatApp from '../components/chat/ChatApp';
import { IState } from '../reducers/states';

type OwnProps = {
  roomId: string | null;
};

const mapStateToProps: MapStateToProps<{}, OwnProps, IState> = (state, props) => ({
  accessToken: state.session.accessToken,
  roomId: props.roomId
});

export default connect(
  mapStateToProps,
  {}
)(ChatApp);
