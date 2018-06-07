import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { changeActiveTab } from '../../actions/playground'
import SideContent, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../components/workspace/side-content'
import { IState } from '../../reducers/states'

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    activeTab: state.playground.sideContentActiveTab
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleChangeActiveTab: changeActiveTab
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(SideContent)
