import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { changeSublanguage, fetchSublanguage } from '../../../commons/workspace/WorkspaceActions';

import AcademyDefaultChapter, { DispatchProps, StateProps } from './AcademyDefaultChapter';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchSublanguage: fetchSublanguage,
      handleUpdateSublanguage: changeSublanguage
    },
    dispatch
  );

const AcademyDefaultChapterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AcademyDefaultChapter);

export default AcademyDefaultChapterContainer;
