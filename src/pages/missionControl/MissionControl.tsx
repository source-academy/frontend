import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { AssessmentStatuses } from 'src/commons/assessment/AssessmentTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { EditingOverviewCard } from 'src/commons/editingOverviewCard/EditingOverviewCard';
import { OwnProps as EditingWorkspaceOwnProps } from 'src/commons/editingWorkspace/EditingWorkspace';
import EditingWorkspaceContainer from 'src/commons/editingWorkspace/EditingWorkspaceContainer';
import MissionCreator from 'src/commons/missionCreator/MissionCreatorContainer';
import Constants from 'src/commons/utils/Constants';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { convertParamToInt } from 'src/commons/utils/ParamParseHelper';
import { retrieveLocalAssessmentOverview } from 'src/commons/XMLParser/XMLParserHelper';
import { numberRegExp } from 'src/features/academy/AcademyTypes';

const nullFunction = () => {};

const MissionControl: React.FC = () => {
  const { assessmentConfigurations } = useTypedSelector(state => state.session);
  const assessmentTypes = assessmentConfigurations?.map(e => e.type) || [];

  const [editingOverview, setEditingOverview] = useState(retrieveLocalAssessmentOverview());

  const params = useParams<{
    assessmentId: string;
    questionId: string;
  }>();

  // If assessmentId or questionId is defined but not numeric, redirect back to the MissionControl overviews page
  if (
    (params.assessmentId && !params.assessmentId?.match(numberRegExp)) ||
    (params.questionId && !params.questionId?.match(numberRegExp))
  ) {
    return <Navigate to={`/mission-control`} />;
  }

  const assessmentId: number | null = convertParamToInt(params.assessmentId);
  const questionId: number = convertParamToInt(params.questionId) || Constants.defaultQuestionId;

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
          assessmentTypes={assessmentTypes}
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
