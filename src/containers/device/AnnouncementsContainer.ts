import { connect, MapStateToProps } from 'react-redux'

import Announcements, { IAnnouncementsProps } from '../../components/device/Announcements'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<IAnnouncementsProps, {}, IState> = state => {
  return {
    announcements: [
      {
        author: 'Bob the builder',
        title: 'Can We Fix It? A curious study -',
        content: 'Turns out, we can!',
        pinned: true
      }
    ]
  }
}

export default connect(mapStateToProps)(Announcements)
