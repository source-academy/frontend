import { connect, MapStateToProps } from 'react-redux';

import NavigationBar, { StateProps } from '../../components/academy/NavigationBar';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<StateProps, {}, {}> = (state: IState) => ({
  notifications: state.session.notifications
});

export default connect(mapStateToProps)(NavigationBar);
