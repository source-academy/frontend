import { connect, MapStateToProps } from 'react-redux'

import Game from '../components/game'
import { IGameState, IState } from '../reducers/states'

const mapStateToProps: MapStateToProps<IGameState, {}, IState> = state => ({
  canvas: state.game.canvas
})

export default connect(mapStateToProps)(Game)
