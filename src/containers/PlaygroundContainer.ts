import * as Actions from '../actions/index'
import PlaygroundComponent from '../components/Playground';

import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { Dispatch } from 'redux';
import { IPlaygroundProps as PlaygroundProps} from '../components/Playground';
import { IState } from '../reducers';


type StateProps = Pick<PlaygroundProps, 'initialCode'>;
type DispatchProps = Pick<PlaygroundProps, 'updateCode'>;

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => {
  return {
    initialCode: state.application.playgroundCode
  }
}

const mapDispatchToProps : MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) => {
  return {
    updateCode: (newCode: string) => {
      dispatch(Actions.updatePlaygroundCode(newCode));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaygroundComponent)
