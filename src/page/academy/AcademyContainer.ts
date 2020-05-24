import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

// TODO: Import from commons
import { fetchNotifications } from '../../actions/session';
// TODO: Import from commons
import { IState } from '../../reducers/states';
import Academy, { IAcademyDispatchProps, IAcademyStateProps } from './AcademyComponent';

const mapStateToProps: MapStateToProps<IAcademyStateProps, {}, IState> = state => ({
  historyHelper: state.session.historyHelper
});

const mapDispatchToProps: MapDispatchToProps<IAcademyDispatchProps, {}> = dispatch =>
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
