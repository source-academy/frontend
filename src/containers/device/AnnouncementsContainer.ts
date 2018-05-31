import { connect, MapStateToProps } from 'react-redux'

import Announcements, { IAnnouncementsProps } from '../../components/device/Announcements'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<IAnnouncementsProps, {}, IState> = state => {
  return {
    announcements: state.session.announcements
  }
}

export default connect(mapStateToProps)(Announcements)
