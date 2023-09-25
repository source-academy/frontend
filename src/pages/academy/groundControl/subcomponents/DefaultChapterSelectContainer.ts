import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { OverallState } from 'src/commons/redux/AllTypes';
import { allWorkspaceActions } from 'src/commons/redux/workspace/AllWorkspacesRedux';
import Constants from 'src/commons/utils/Constants';

import DefaultChapterSelect, { DispatchProps, StateProps } from './DefaultChapterSelect';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  // Temporarily load the defaults when the course configuration fetch has yet to return
  sourceChapter: state.session.sourceChapter || Constants.defaultSourceChapter,
  sourceVariant: state.session.sourceVariant || Constants.defaultSourceVariant
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      // TODO Check this
      handleUpdateSublanguage: lang => allWorkspaceActions.changeSublanguage('playground', lang)
    },
    dispatch
  );

const DefaultChapterSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DefaultChapterSelect);

export default DefaultChapterSelectContainer;
