import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchMaterialIndex } from '../../actions';
import GameDev, { IDispatchProps, IStateProps } from '../../components/game-dev/GameDev';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  materialDirectoryTree: state.session.materialDirectoryTree,
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchMaterialIndex: (id?: number) => fetchMaterialIndex(id)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameDev);
