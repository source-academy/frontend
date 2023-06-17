import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../application/ApplicationTypes';
import { evalTestcase } from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import EditingWorkspace, { DispatchProps, OwnProps, StateProps } from './EditingWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    hasUnsavedChanges: state.workspaces.assessment.hasUnsavedChanges
  };
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId)
    },
    dispatch
  );

const EditingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(EditingWorkspace);

export default EditingWorkspaceContainer;
