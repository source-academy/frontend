import { connect, MapDispatchToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { changeToken, fetchUsername } from '../../actions/session'
import Academy, { IDispatchProps } from '../../components/academy'

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      changeToken,
      fetchUsername
    },
    dispatch
  )

export default withRouter(connect(null, mapDispatchToProps)(Academy))
