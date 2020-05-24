import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { changeChapter, fetchChapter } from 'src/actions'; 
import { IChapter } from 'src/commons/controlBar/ChapterSelect';
import { IState } from 'src/reducers/states';

import { DefaultChapter, IDispatchProps, IStateProps } from './AcademyDefaultChapterComponent';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchChapter: () => fetchChapter(),
      handleUpdateChapter: (chapter: IChapter) => changeChapter(chapter.chapter, chapter.variant)
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DefaultChapter)
);
