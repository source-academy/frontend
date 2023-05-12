import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  AssessmentStatuses,
  AssessmentType,
  AssessmentWorkspaceParams
} from 'src/commons/assessment/AssessmentTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { EditingOverviewCard } from 'src/commons/editingOverviewCard/EditingOverviewCard';
import { OwnProps as EditingWorkspaceOwnProps } from 'src/commons/editingWorkspace/EditingWorkspace';
import EditingWorkspaceContainer from 'src/commons/editingWorkspace/EditingWorkspaceContainer';
import MissionCreator from 'src/commons/missionCreator/MissionCreatorContainer';
import Constants from 'src/commons/utils/Constants';
import { convertParamToInt } from 'src/commons/utils/ParamParseHelper';
import { retrieveLocalAssessmentOverview } from 'src/commons/XMLParser/XMLParserHelper';

export type MissionControlProps = StateProps & RouteComponentProps<AssessmentWorkspaceParams>;

export type StateProps = {
  assessmentTypes: AssessmentType[];
};

const nullFunction = () => {};

const MissionControl: React.FC<MissionControlProps> = props => {
  const [editingOverview, setEditingOverview] = useState(retrieveLocalAssessmentOverview());

  const assessmentId: number | null = convertParamToInt(props.match.params.assessmentId);
  const questionId: number =
    convertParamToInt(props.match.params.questionId) || Constants.defaultQuestionId;

  // If mission for testing is to render, create workspace
  if (assessmentId === -1 && editingOverview) {
    const overview = editingOverview;
    const assessmentProps: EditingWorkspaceOwnProps = {
      assessmentId,
      questionId,
      assessmentOverview: overview,
      updateAssessmentOverview: setEditingOverview,
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
      <MissionCreator updateEditingOverview={setEditingOverview} />
      {editingOverview && (
        <EditingOverviewCard
          overview={editingOverview}
          updateEditingOverview={setEditingOverview}
          listingPath="/mission-control"
          assessmentTypes={props.assessmentTypes}
        />
      )}
    </>
  );

  // Finally, render the ContentDisplay.
  return (
    <div className="Assessment Academy">
      <ContentDisplay display={display} loadContentDispatch={nullFunction} />
    </div>
  );
};

export default MissionControl;
