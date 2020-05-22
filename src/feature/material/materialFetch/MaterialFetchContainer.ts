import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { IState } from '../../../reducers/states';
import { fetchMaterialIndex } from './MaterialFetchAction';
import MaterialFetch, {
  IMaterialFetchDispatchProps,
  IMaterialFetchStateProps
} from './MaterialFetchComponent';

const mapStateToProps: MapStateToProps<IMaterialFetchStateProps, {}, IState> = state => ({
  materialDirectoryTree: state.session.materialDirectoryTree,
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IMaterialFetchDispatchProps, {}> = (
  dispatch: Dispatch<any>
) =>
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
