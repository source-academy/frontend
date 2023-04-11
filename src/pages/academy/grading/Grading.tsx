import { NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { GradingWorkspaceParams } from 'src/features/grading/GradingTypes';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingDashboard from './subcomponents/GradingDashboard';
import { OwnProps as GradingWorkspaceOwnProps } from './subcomponents/GradingWorkspace';
import GradingWorkspaceContainer from './subcomponents/GradingWorkspaceContainer';

type GradingProps = RouteComponentProps<GradingWorkspaceParams>;

const Grading: React.FC<GradingProps> = ({ match }) => {
  const submissionId: number | null = convertParamToInt(match.params.submissionId);
  // default questionId is 0 (the first question)
  const questionId: number = convertParamToInt(match.params.questionId) || 0;
  const gradingOverviews = useTypedSelector(state => state.session.gradingOverviews);

  /* Create a workspace to grade a submission. */
  if (submissionId !== null) {
    const props: GradingWorkspaceOwnProps = {
      submissionId,
      questionId
    };
    return <GradingWorkspaceContainer {...props} />;
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
    ) || [];

  const exportCSV = () => {
    if (!gradingOverviews) return;

    const win = document.defaultView || window;
    if (!win) {
      console.warn('There is no `window` associated with the current `document`');
      return;
    }

    const content = new Blob(
      [
        'Assessment Name,Student Name,Group,Status,Grading,Question Count,Questions Graded,Initial XP,XP Adjustment,Current XP (excl. bonus),Max XP,Bonus XP\n',
        ...gradingOverviews.map(
          e =>
            [
              e.assessmentName,
              e.studentName,
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
            ].join(',') + '\n'
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
