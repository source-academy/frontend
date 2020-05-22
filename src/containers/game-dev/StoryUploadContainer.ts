import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchTestStories } from '../../actions';
import StoryUpload, { IDispatchProps, IStateProps } from '../../components/game-dev/StoryUpload';
import { IState } from '../../reducers/states';

// TODO: implement when stories backend is implemented

const emptyAction = { type: "STORY_NOT_IMPLEMENTED" };

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  materialDirectoryTree: [],
  materialIndex: []
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleCreateMaterialFolder: (title: string) => emptyAction,
      handleDeleteMaterial: (id: number) => emptyAction,
      handleDeleteMaterialFolder: (id: number) => emptyAction,
      handleFetchTestStories: () => fetchTestStories(),
      handleFetchMaterialIndex: (id?: number) => emptyAction,
      handleUploadMaterial: (file: File, title: string, description: string) => emptyAction
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StoryUpload);
