import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import {
  AssessmentOverview,
  AssessmentStatuses,
  AssessmentType,
  AssessmentWorkspaceParams
} from '../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../commons/ContentDisplay';
import { EditingOverviewCard } from '../../commons/editingOverviewCard/EditingOverviewCard';
import { OwnProps as EditingWorkspaceOwnProps } from '../../commons/editingWorkspace/EditingWorkspace';
import EditingWorkspaceContainer from '../../commons/editingWorkspace/EditingWorkspaceContainer';
import MissionCreator from '../../commons/missionCreator/MissionCreatorContainer';
import Constants from '../../commons/utils/Constants';
import { stringParamToInt } from '../../commons/utils/ParamParseHelper';
import { retrieveLocalAssessmentOverview } from '../../commons/XMLParser/XMLParserHelper';

export type MissionControlProps = StateProps &
  DispatchProps &
  RouteComponentProps<AssessmentWorkspaceParams>;

export type StateProps = {
  assessmentTypes: AssessmentType[];
};
export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
};

type State = {
  editOverview: string;
  editingOverview: AssessmentOverview | null;
};

class MissionControl extends React.Component<MissionControlProps, State> {
  public constructor(props: MissionControlProps) {
    super(props);
    this.state = {
      editOverview: '',
      editingOverview: retrieveLocalAssessmentOverview()
    };
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId);
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || Constants.defaultQuestionId;

    // If mission for testing is to render, create workspace
    if (assessmentId === -1 && this.state.editingOverview) {
      const overview = this.state.editingOverview;
      const assessmentProps: EditingWorkspaceOwnProps = {
        assessmentId,
        questionId,
        assessmentOverview: overview,
        updateAssessmentOverview: this.updateEditingOverview,
        notAttempted: overview.status === AssessmentStatuses.not_attempted,
        closeDate: overview.closeAt
      };
      return (
        <div className="Academy">
          <EditingWorkspaceContainer {...assessmentProps} />
        </div>
      );
    }

    const display = (
      <>
        <MissionCreator updateEditingOverview={this.updateEditingOverview} />
        {this.state.editingOverview && (
          <EditingOverviewCard
            overview={this.state.editingOverview}
            updateEditingOverview={this.updateEditingOverview}
            listingPath="/mission-control"
            assessmentTypes={this.props.assessmentTypes}
          />
        )}
      </>
    );

    // Finally, render the ContentDisplay.
    return (
      <div className="Assessment Academy">
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
      </div>
    );
  }

  private updateEditingOverview = (overview: AssessmentOverview) => {
    this.setState({
      editingOverview: overview
    });
  };
}

export default MissionControl;
