import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

// TODO: Import from commons
import { fetchNotifications } from 'src/actions/session';
// TODO: Import from commons
import { IState } from 'src/reducers/states';
import Academy, { DispatchProps, OwnProps, StateProps } from './AcademyComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  historyHelper: state.session.historyHelper
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch =>
  bindActionCreators(
    {
      handleFetchNotifications: fetchNotifications
    },
    dispatch
  );

interface IAcademyPropType extends OwnProps, RouteComponentProps<any> {}

export default withRouter<IAcademyPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Academy)
);
