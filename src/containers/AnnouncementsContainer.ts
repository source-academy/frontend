/**
 * This component is on hold until an endpoint is implemented at
 * source-academy/cadet which is able to download and relay news and material
 * from lumiNUS to us.
 */
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAnnouncements } from '../actions/session';
import Announcements, { IAnnouncementsProps } from '../components/Announcements';
import { IState } from '../reducers/states';

type StateProps = Pick<IAnnouncementsProps, 'announcements'>;
type DispatchProps = Pick<IAnnouncementsProps, 'handleAnnouncementsFetch'>;

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  announcements: state.session.announcements
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAnnouncementsFetch: fetchAnnouncements
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Announcements);
