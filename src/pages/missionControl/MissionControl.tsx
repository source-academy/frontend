import classNames from 'classnames';
import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import academyClasses from 'src/styles/Academy.module.scss';

import { AssessmentStatuses } from '../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../commons/ContentDisplay';
import { EditingOverviewCard } from '../../commons/editingOverviewCard/EditingOverviewCard';
import EditingWorkspace, {
  EditingWorkspaceProps
} from '../../commons/editingWorkspace/EditingWorkspace';
import MissionCreator from '../../commons/missionCreator/MissionCreator';
import Constants from '../../commons/utils/Constants';
import { convertParamToInt } from '../../commons/utils/ParamParseHelper';
import { retrieveLocalAssessmentOverview } from '../../commons/XMLParser/XMLParserHelper';

const MissionControl: React.FC = () => {
  const { assessmentConfigurations } = useSession();
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
    const assessmentProps: EditingWorkspaceProps = {
      assessmentId,
      questionId,
      assessmentOverview: overview,
      updateAssessmentOverview: setEditingOverview,
      notAttempted: overview.status === AssessmentStatuses.not_attempted,
      closeDate: overview.closeAt
    };
    return (
      <div className={academyClasses['Academy']}>
        <EditingWorkspace {...assessmentProps} />
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
    <div className={classNames('Assessment', academyClasses['Academy'])}>
      <ContentDisplay display={display} />
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = MissionControl;
Component.displayName = 'MissionControl';

export default MissionControl;
