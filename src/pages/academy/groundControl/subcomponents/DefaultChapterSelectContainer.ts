import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../../commons/application/ApplicationTypes';
import { changeSublanguage } from '../../../../commons/workspace/WorkspaceActions';
import DefaultChapterSelect, { DispatchProps, StateProps } from './DefaultChapterSelect';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleUpdateSublanguage: changeSublanguage
    },
    dispatch
  );

const DefaultChapterSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DefaultChapterSelect);

export default DefaultChapterSelectContainer;
