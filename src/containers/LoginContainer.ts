import { connect, MapDispatchToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { login } from '../actions/session'
import Login, { DispatchProps } from '../components/Login'

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleLogin: login
    },
    dispatch
  )

export default connect(undefined, mapDispatchToProps)(Login)
