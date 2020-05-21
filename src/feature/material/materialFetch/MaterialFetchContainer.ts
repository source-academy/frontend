import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchMaterialIndex } from './MaterialFetchAction';
import MaterialFetch, { IMaterialFetchDispatchProps, IMaterialFetchStateProps } from './MaterialFetchComponent'
import { IMaterialState } from '../materialReducer'

const mapStateToProps: MapStateToProps<IMaterialFetchStateProps, {}, IMaterialState> = state => ({
  materialDirectoryTree: state.session.materialDirectoryTree,
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IMaterialFetchDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchMaterialIndex: (id?: number) => fetchMaterialIndex(id)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MaterialFetch);
