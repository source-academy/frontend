import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { deleteMaterial, uploadMaterial } from '../../../actions';
import { fetchMaterialIndex } from '../../../actions/materials';
import Material, { IDispatchProps, IStateProps } from '../../../components/academy/materials';
import { IState } from '../../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  data: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
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
