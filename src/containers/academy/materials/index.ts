import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  createMaterialFolder,
  deleteMaterial,
  fetchMaterialIndex,
  uploadMaterial
} from '../../../actions';
import Material, { IDispatchProps, IStateProps } from '../../../components/academy/materialsUpload';
import { IState } from '../../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleCreateMaterialFolder: (name: string) => createMaterialFolder(name),
      handleDeleteMaterial: (id: number) => deleteMaterial(id),
      handleFetchMaterialIndex: () => fetchMaterialIndex(),
      handleUploadMaterial: (file: File, title: string, description: string) =>
        uploadMaterial(file, title, description)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Material);
