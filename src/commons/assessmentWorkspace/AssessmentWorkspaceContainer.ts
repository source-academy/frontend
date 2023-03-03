import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitAnswer } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import {
  evalRepl,
  setEditorBreakpoint,
  updateEditorValue,
  updateHasUnsavedChanges
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import AssessmentWorkspace, { DispatchProps, OwnProps, StateProps } from './AssessmentWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    courseId: state.session.courseId,
    assessment: state.session.assessments.get(props.assessmentId),
    autogradingResults: state.workspaces.assessment.autogradingResults,
    programPrependValue: state.workspaces.assessment.programPrependValue,
    programPostpendValue: state.workspaces.assessment.programPostpendValue,
    editorTestcases: state.workspaces.assessment.editorTestcases,
    hasUnsavedChanges: state.workspaces.assessment.hasUnsavedChanges,
    isRunning: state.workspaces.assessment.isRunning,
    isDebugging: state.workspaces.assessment.isDebugging,
    enableDebugging: state.workspaces.assessment.enableDebugging,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    storedAssessmentId: state.workspaces.assessment.currentAssessment,
    storedQuestionId: state.workspaces.assessment.currentQuestion
  };
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      // TODO: Hardcoded to make use of the first editor tab. Refactoring is needed for this workspace to enable multiple files.
      handleEditorValueChange: (newEditorValue: string) =>
        updateEditorValue(workspaceLocation, 0, newEditorValue),
      handleEditorUpdateBreakpoints: (newBreakpoints: string[]) =>
        setEditorBreakpoint(workspaceLocation, 0, newBreakpoints),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleSave: submitAnswer,
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges)
    },
    dispatch
  );

const AssessmentWorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssessmentWorkspace);

export default AssessmentWorkspaceContainer;
