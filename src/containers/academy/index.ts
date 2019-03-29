import { connect, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';

import Academy, { IStateProps } from '../../components/academy';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  historyHelper: state.session.historyHelper
});

export default withRouter(connect(mapStateToProps)(Academy));
