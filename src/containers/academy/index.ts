import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'
import { bindActionCreators, Dispatch } from 'redux'

import { fetchTokens, fetchUsername } from '../../actions/session'
import Academy, { IDispatchProps, IStateProps } from '../../components/academy'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  historyHelper: state.session.historyHelper
})

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchTokens: fetchTokens,
      handleFetchUsername: fetchUsername
    },
    dispatch
  )

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Academy))
