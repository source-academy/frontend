import { connect, MapStateToProps } from 'react-redux'
import { withRouter } from 'react-router'

import Playground, { IPlaygroundProps } from '../components/Playground'
import { IState } from '../reducers/states'

type StateProps = Pick<IPlaygroundProps, 'editorValue'>

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  editorValue: state.workspaces.playground.editorValue
})

export default withRouter(connect(mapStateToProps)(Playground))
