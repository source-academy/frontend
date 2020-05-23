import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { bindActionCreators } from 'redux';
import { fetchNotifications } from '../../actions';
import Academy, { IDispatchProps, IOwnProps, IStateProps } from '../../components/academy';
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

interface IPropType extends IOwnProps, RouteComponentProps<any> {}

export default withRouter<IPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Academy)
);
