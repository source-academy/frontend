import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import { fetchNotifications } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';

import Academy, { DispatchProps, OwnProps, StateProps } from './AcademyComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  historyHelper: state.session.historyHelper
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch =>
  bindActionCreators(
    {
      handleFetchNotifications: fetchNotifications
    },
    dispatch
  );

type AcademyPropType = OwnProps & RouteComponentProps<any>;

const AcademyContainer = withRouter<AcademyPropType>(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Academy)
);

export default AcademyContainer;
