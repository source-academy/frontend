import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../application/ApplicationTypes';
import Assessment, { OwnProps } from './Assessment';

const mapStateToProps: MapStateToProps<{}, OwnProps, OverallState> = (state, props) => ({});
const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AssessmentContainer = connect(mapStateToProps, mapDispatchToProps)(Assessment);

export default AssessmentContainer;
