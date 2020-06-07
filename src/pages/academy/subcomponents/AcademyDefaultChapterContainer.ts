import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { Chapter } from '../../../commons/application/types/ChapterTypes';
import { changeChapter, fetchChapter } from '../../../commons/workspace/WorkspaceActions';

import { DefaultChapter, DispatchProps, StateProps } from './AcademyDefaultChapter';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchChapter: () => fetchChapter(),
      handleUpdateChapter: (chapter: Chapter) => changeChapter(chapter.chapter, chapter.variant)
    },
    dispatch
  );

const AcademyDefaultChapterContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DefaultChapter)
);

export default AcademyDefaultChapterContainer;
