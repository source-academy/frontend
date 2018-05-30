import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { changeToken } from '../actions/session'
import Login, { ILoginProps } from '../components/Login'
import { ISessionState } from '../reducers/states'

type stateProps = Pick<ILoginProps, 'token'>
type dispatchProps = Pick<ILoginProps, 'handleChangeToken'>

const mapStateToProps: MapStateToProps<stateProps, {}, ISessionState> = state => ({
  token: state.token
})

const mapDispatchToProps: MapDispatchToProps<dispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChangeToken: changeToken
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Login)
