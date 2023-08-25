import { NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import { exportGradingCSV } from 'src/features/grading/GradingUtils';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingDashboard from './subcomponents/GradingDashboard';
import GradingWorkspace from './subcomponents/GradingWorkspace';

const Grading: React.FC = () => {
  const { courseId, gradingOverviews, role } = useSession();
  const params = useParams<{
    submissionId: string;
    questionId: string;
  }>();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchGradingOverviews(role !== Role.Admin));
  }, [dispatch, role]);

  // If submissionId or questionId is defined but not numeric, redirect back to the Grading overviews page
  if (
    (params.submissionId && !params.submissionId?.match(numberRegExp)) ||
    (params.questionId && !params.questionId?.match(numberRegExp))
  ) {
    return <Navigate to={`/courses/${courseId}/grading`} />;
  }

  const submissionId: number | null = convertParamToInt(params.submissionId);
  // default questionId is 0 (the first question)
  const questionId: number = convertParamToInt(params.questionId) || 0;

  /* Create a workspace to grade a submission. */
  if (submissionId !== null) {
    return <GradingWorkspace questionId={questionId} submissionId={submissionId} />;
  }

  /* Display either a loading screen or a table with overviews. */
  const loadingDisplay = (
    <NonIdealState
      className="Grading"
      description="Fetching submissions..."
      icon={<Spinner size={SpinnerSize.LARGE} />}
    />
  );

  const submissions =
    gradingOverviews?.map(e =>
      !e.studentName ? { ...e, studentName: '(user has yet to log in)' } : e
    ) ?? [];

  return (
    <ContentDisplay
      display={
        gradingOverviews === undefined ? (
          loadingDisplay
        ) : (
          // FIXME: I think the GradingDashboard component
          // is an unnecessary abstraction and should be removed?
          // Having it only adds complexity and coupling as the logic
          // needs to be passed back and forth
          <GradingDashboard
            submissions={submissions}
            handleCsvExport={() => exportGradingCSV(gradingOverviews)}
          />
        )
      }
      fullWidth={true}
    />
  );
};

export default Grading;
