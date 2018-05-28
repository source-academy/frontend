import { connect, MapStateToProps } from 'react-redux'

import Device, { IDeviceProps } from '../components/Device'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<IDeviceProps, {}, IState> = state => ({
  token: state.session.token
})

export default connect(mapStateToProps)(Device)
