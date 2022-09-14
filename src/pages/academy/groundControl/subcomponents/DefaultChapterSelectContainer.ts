import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Constants from 'src/commons/utils/Constants';

import { OverallState } from '../../../../commons/application/ApplicationTypes';
import { changeSublanguage } from '../../../../commons/workspace/WorkspaceActions';
import DefaultChapterSelect, { DispatchProps, StateProps } from './DefaultChapterSelect';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  // Temporarily load the defaults when the course configuration fetch has yet to return
  sourceChapter: state.session.sourceChapter || Constants.defaultSourceChapter,
  sourceVariant: state.session.sourceVariant || Constants.defaultSourceVariant
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
