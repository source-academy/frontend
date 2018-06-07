import { connect, MapStateToProps } from 'react-redux'

import Academy, { StateProps } from '../../components/academy'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  token: state.session.token
})

export default connect(mapStateToProps)(Academy)
