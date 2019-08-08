import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchMaterialIndex } from '../actions';
import Material, { IDispatchProps, IStateProps } from '../components/materials';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  materialIndex: state.session.materialIndex
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchMaterialIndex: () => fetchMaterialIndex()
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Material);
