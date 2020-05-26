import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from 'src/commons/application/ApplicationTypes';
import { Chapter } from 'src/commons/application/types/ChapterTypes';
import { changeChapter, fetchChapter } from 'src/commons/workspace/WorkspaceActions';

import { DefaultChapter, DispatchProps, StateProps } from './AcademyDefaultChapterComponent';

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

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DefaultChapter)
);
