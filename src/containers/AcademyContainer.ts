import { connect, MapDispatchToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { changeToken } from '../actions/session'
import Academy, { IDispatchProps } from '../components/academy'

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      changeToken
    },
    dispatch
  )

export default withRouter(connect(null, mapDispatchToProps)(Academy))
