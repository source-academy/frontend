import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchRepos } from '../actions/contributors';
import Contributors, { IDispatchProps, IStateProps } from '../components/Contributors';
import { IState } from '../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = (state) => ({
   repos: state.contributors.repos,
   contributors: state.contributors.contributors
 });

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchRepos: () => fetchRepos()
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Contributors);