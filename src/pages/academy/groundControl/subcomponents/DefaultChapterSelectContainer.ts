import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../../commons/application/ApplicationTypes';
import DefaultChapterSelect, { StateProps } from './DefaultChapterSelect';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const DefaultChapterSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DefaultChapterSelect);

export default DefaultChapterSelectContainer;
