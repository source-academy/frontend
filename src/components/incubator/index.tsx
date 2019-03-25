import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import EditingWorkspaceContainer from '../../containers/incubator/EditingWorkspaceContainer';
import ImportFromFileComponent from '../../containers/incubator/ImportFromFileComponentContainer';
import { stringParamToInt } from '../../utils/paramParseHelpers';
import { retrieveLocalAssessmentOverview } from '../../utils/xmlParser';
import { AssessmentStatuses, IAssessmentOverview } from '../assessment/assessmentShape';
import ContentDisplay from '../commons/ContentDisplay';
import { EditingOverviewCard } from '../incubator/EditingOverviewCard';
import { OwnProps as AssessmentProps } from '../incubator/EditingWorkspace';

const DEFAULT_QUESTION_ID: number = 0;

export interface IAssessmentWorkspaceParams {
  assessmentId?: string;
  questionId?: string;
}

export interface IAssessmentProps
  extends IDispatchProps,
    RouteComponentProps<IAssessmentWorkspaceParams>,
    IStateProps {}

export interface IDispatchProps {
  handleAssessmentOverviewFetch: () => void;
  handleSubmitAssessment: (id: number) => void;
}

export interface IStateProps {
  isStudent: boolean;
}

type State = {
  editOverview: string;
  editingOverview: IAssessmentOverview | null;
};

class Assessment extends React.Component<IAssessmentProps, State> {
  /**
   * Initialize state
   */
  public constructor(props: IAssessmentProps) {
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
        const assessmentProps: AssessmentProps = {
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
        listingPath="/incubator"
      />
    ) : null;

    const display = (
      <>
        <ImportFromFileComponent updateEditingOverview={this.updateEditingOverview} />
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

export default Assessment;
