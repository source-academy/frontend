import { connect, MapStateToProps } from 'react-redux'

import Login, { ILoginProps } from '../components/Login'
import { IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<ILoginProps, {}, IState> = state => ({
  token: state.session.token
})

export default connect(mapStateToProps)(Login)
