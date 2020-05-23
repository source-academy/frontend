import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';


import { DefaultChapter, IDispatchProps, IStateProps } from './AcademyDefaultChapterComponent';
import { IChapter } from '../../../commons/controlBar/ChapterSelect';
// TODO: Import from commons
import { changeChapter, fetchChapter } from '../../../actions';
// TODO: Import from commons
import { IState } from '../../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  sourceChapter: state.workspaces.playground.context.chapter,
  sourceVariant: state.workspaces.playground.context.variant
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
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
