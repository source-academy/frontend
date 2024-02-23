import { ColumnFilter } from '@tanstack/react-table';
import { GradingStatuses } from 'src/commons/assessment/AssessmentTypes';

import { GradingOverview } from './GradingTypes';

// TODO: Unused. Marked for deletion.
export const isSubmissionUngraded = (s: GradingOverview): boolean => {
  const isSubmitted = s.submissionStatus === 'submitted';
  const isNotGraded =
    s.gradingStatus !== GradingStatuses.graded && s.gradingStatus !== GradingStatuses.excluded;
  return isSubmitted && isNotGraded;
};

export const exportGradingCSV = (gradingOverviews: GradingOverview[] | undefined) => {
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

// Cleanup work: change all references to column properties in backend saga to backend name to reduce
// un-needed hardcode conversion, ensuring that places that reference it are updated. A two-way conversion
// function would be good to implement in GradingUtils.
export const convertFilterToBackendParams = (column: ColumnFilter) => {
  switch (column.id) {
    case 'assessmentName':
      return { title: column.value };
    case 'assessmentType':
      return { type: column.value };
    case 'studentName':
      return { name: column.value };
    case 'studentUsername':
      return { username: column.value };
    case 'submissionStatus':
      return { status: column.value };
    case 'groupName':
      return { groupName: column.value };
    default:
      return {};
  }
};

export const paginationToBackendParams = (page: number, pageSize: number) => {
  return { offset: page * pageSize, pageSize: pageSize };
};

export const ungradedToBackendParams = (showAll: boolean) => {
  if (showAll) {
    return {};
  }
  return {
    status: 'submitted',
    isManuallyGraded: true,
    notFullyGraded: true
  };
};
