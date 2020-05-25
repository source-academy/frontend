import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

// TODO: Import from commons
import { fetchNotifications } from 'src/commons/actions/SessionActions';
// TODO: Import from commons
import { IState } from 'src/reducers/states';
import Academy, { IAcademyDispatchProps, IAcademyOwnProps, IAcademyStateProps } from './AcademyComponent';

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

interface IAcademyPropType extends IAcademyOwnProps, RouteComponentProps<any> {}

export default withRouter<IAcademyPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Academy)
);
