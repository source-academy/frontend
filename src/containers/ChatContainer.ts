import { connect, MapStateToProps } from 'react-redux';

import ChatApp from '../components/chat/ChatApp';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<{}, {}, IState> = state => ({
  accessToken: state.session.accessToken
});

export default connect(
  mapStateToProps,
  {}
)(ChatApp);
