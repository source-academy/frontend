import { NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';

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
  React.useEffect(() => {
    dispatch(fetchGradingOverviews(role === Role.Admin));
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

  const data =
    gradingOverviews?.map(e =>
      !e.studentName ? { ...e, studentName: '(user has yet to log in)' } : e
    ) ?? [];

  const exportCSV = () => {
    if (!gradingOverviews) return;

    const win = document.defaultView || window;
    if (!win) {
      console.warn('There is no `window` associated with the current `document`');
      return;
    }

    const content = new Blob(
      [
        '"Assessment Number","Assessment Name","Student Name","Student Username","Group","Status","Grading","Question Count","Questions Graded","Initial XP","XP Adjustment","Current XP (excl. bonus)","Max XP","Bonus XP"\n',
        ...gradingOverviews.map(
          e =>
            [
              e.assessmentNumber,
              e.assessmentName,
              e.studentName,
              e.studentUsername,
              e.groupName,
              e.submissionStatus,
              e.gradingStatus,
              e.questionCount,
              e.gradedCount,
              e.initialXp,
              e.xpAdjustment,
              e.currentXp,
              e.maxXp,
              e.xpBonus
            ]
              .map(field => `"${field}"`) // wrap each field in double quotes in case it contains a comma
              .join(',') + '\n'
        )
      ],
      { type: 'text/csv' }
    );
    const fileName = `SA submissions (${new Date().toISOString()}).csv`;

    // code from https://github.com/ag-grid/ag-grid/blob/latest/grid-community-modules/csv-export/src/csvExport/downloader.ts
    const element = document.createElement('a');
    const url = win.URL.createObjectURL(content);
    element.setAttribute('href', url);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);

    element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: false,
        cancelable: true,
        view: win
      })
    );

    document.body.removeChild(element);

    win.setTimeout(() => {
      win.URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <ContentDisplay
      display={
        gradingOverviews === undefined ? (
          loadingDisplay
        ) : (
          <GradingDashboard submissions={data} handleCsvExport={exportCSV} />
        )
      }
      fullWidth={true}
    />
  );
};

export default Grading;
