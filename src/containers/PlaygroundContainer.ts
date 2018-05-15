import { connect, MapStateToProps } from 'react-redux'

import { IPlaygroundProps as PlaygroundProps } from '../components/Playground';
import PlaygroundComponent from '../components/Playground';
import { IState } from '../reducers';

const mapStateToProps: MapStateToProps<PlaygroundProps, {}, IState> = state => {
  console.log('MapStateToProps with inittialCode ' + state.application.playgroundCode)
  return {
  initialCode: state.application.playgroundCode
}
}

export default connect(mapStateToProps)(PlaygroundComponent)
