import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import ContentDisplay from 'src/commons/ContentDisplay';
import { AssessmentStatuses, IAssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { EditingOverviewCard } from 'src/commons/editingOverviewCard/EditingOverviewCardComponent';
import { EditingWorkspaceOwnProps } from 'src/commons/editingWorkspace/EditingWorkspaceComponent';
import EditingWorkspaceContainer from 'src/commons/editingWorkspace/EditingWorkspaceContainer';
import MissionCreator from 'src/commons/missionCreator/MissionCreatorContainer';
import { retrieveLocalAssessmentOverview } from 'src/commons/XMLParser/XMLParserHelper';
import { stringParamToInt } from 'src/utils/paramParseHelpers';

const DEFAULT_QUESTION_ID: number = 0;

// TODO: Inspect this, same as IAssessmentWorkspaceParams
export interface IMissionControlParams {
  assessmentId?: string;
  questionId?: string;
}

export interface IMissionControlProps
  extends IMissionControlDispatchProps,
    RouteComponentProps<IMissionControlParams>,
    IMissionControlStateProps {}

export interface IMissionControlDispatchProps {
  handleAssessmentOverviewFetch: () => void;
  handleSubmitAssessment: (id: number) => void;
}

export interface IMissionControlStateProps {
  isStudent: boolean;
}

type State = {
  editOverview: string;
  editingOverview: IAssessmentOverview | null;
};

class MissionControl extends React.Component<IMissionControlProps, State> {
  /**
   * Initialize state
   */
  public constructor(props: IMissionControlProps) {
    super(props);
    this.state = {
      editOverview: '',
      editingOverview: retrieveLocalAssessmentOverview()
    };
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId);
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID;

    // If mission for testing is to render, create workspace
    if (assessmentId === -1) {
      if (this.state.editingOverview) {
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
    }

    /** Mission editing card */
    const missionEditingCard = this.state.editingOverview ? (
      <EditingOverviewCard
        overview={this.state.editingOverview}
        updateEditingOverview={this.updateEditingOverview}
        listingPath="/mission-control"
      />
    ) : null;

    const display = (
      <>
        <MissionCreator updateEditingOverview={this.updateEditingOverview} />
        {missionEditingCard}
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

  private updateEditingOverview = (overview: IAssessmentOverview) => {
    this.setState({
      editingOverview: overview
    });
  };
}

export default MissionControl;
