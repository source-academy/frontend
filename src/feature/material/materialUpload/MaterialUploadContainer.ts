import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  createMaterialFolder,
  deleteMaterial,
  deleteMaterialFolder,
  fetchMaterialIndex,
  uploadMaterial
} from '../../../actions';
import MaterialUpload, { IMaterialUploadDispatchProps, IMaterialUploadStateProps } from './MaterialUploadComponent';
// TODO: Import from commons
import { IState } from '../../../reducers/states'; 

const mapStateToProps: MapStateToProps<IMaterialUploadStateProps, {}, IState> = state => ({
  materialDirectoryTree: state.session.materialDirectoryTree,
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IMaterialUploadDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleCreateMaterialFolder: (title: string) => createMaterialFolder(title),
      handleDeleteMaterial: (id: number) => deleteMaterial(id),
      handleDeleteMaterialFolder: (id: number) => deleteMaterialFolder(id),
      handleFetchMaterialIndex: (id?: number) => fetchMaterialIndex(id),
      handleUploadMaterial: (file: File, title: string, description: string) =>
        uploadMaterial(file, title, description)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MaterialUpload);
