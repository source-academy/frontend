import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';

import { bindActionCreators } from 'redux';
import { fetchNotifications } from '../../actions';
import Academy, { IDispatchProps, IStateProps } from '../../components/academy';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  historyHelper: state.session.historyHelper
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = dispatch =>
  bindActionCreators(
    {
      handleFetchNotifications: fetchNotifications
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Academy)
);
