import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { notifyChatUsers } from '../actions';
import ChatApp from '../components/chat/ChatApp';
import { IState } from '../reducers/states';

type OwnProps = {
  assessmentId?: number;
  roomId: string | null;
  submissionId?: number;
};

type DispatchProps = {
  handleNotifyUsers: (assessmentId?: number, submissionId?: number) => void;
};

const mapStateToProps: MapStateToProps<{}, OwnProps, IState> = (state, props) => ({
  accessToken: state.session.accessToken,
  assessmentId: props.assessmentId,
  roomId: props.roomId,
  submissionId: props.submissionId
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleNotifyUsers: notifyChatUsers
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatApp);
