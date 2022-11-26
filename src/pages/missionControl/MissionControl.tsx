import React, { useState } from 'react';
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

export type MissionControlProps = StateProps & RouteComponentProps<AssessmentWorkspaceParams>;

export type StateProps = {
  assessmentTypes: AssessmentType[];
};

const nullFunction = () => {};

const MissionControl: React.FC<MissionControlProps> = props => {
  const [editingOverview, setEditingOverview] = useState(retrieveLocalAssessmentOverview());

  const updateEditingOverview = (overview: AssessmentOverview) => {
    setEditingOverview(overview);
  };

  const assessmentId: number | null = stringParamToInt(props.match.params.assessmentId);
  const questionId: number =
    stringParamToInt(props.match.params.questionId) || Constants.defaultQuestionId;

  // If mission for testing is to render, create workspace
  if (assessmentId === -1 && editingOverview) {
    const overview = editingOverview;
    const assessmentProps: EditingWorkspaceOwnProps = {
      assessmentId,
      questionId,
      assessmentOverview: overview,
      updateAssessmentOverview: updateEditingOverview,
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
      <MissionCreator updateEditingOverview={updateEditingOverview} />
      {editingOverview && (
        <EditingOverviewCard
          overview={editingOverview}
          updateEditingOverview={updateEditingOverview}
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
