import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  // createMaterialFolder,
  deleteMaterial,
  deleteMaterialFolder,
  fetchMaterialIndex,
  fetchTestStories,
  uploadMaterial
} from '../../actions';
import StoryUpload, { IDispatchProps, IStateProps } from '../../components/game-dev/StoryUpload';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  materialDirectoryTree: state.session.materialDirectoryTree,
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleCreateMaterialFolder: (title: string) => null,
      handleDeleteMaterial: (id: number) => deleteMaterial(id),
      handleDeleteMaterialFolder: (id: number) => deleteMaterialFolder(id),
      handleFetchTestStories: () => fetchTestStories(),
      handleFetchMaterialIndex: (id?: number) => fetchMaterialIndex(id),
      handleUploadMaterial: (file: File, title: string, description: string) =>
        uploadMaterial(file, title, description)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StoryUpload);
