import { ColumnFilter } from '@tanstack/react-table';
import {
  AssessmentStatus,
  AssessmentStatuses,
  ProgressStatus,
  ProgressStatuses
} from 'src/commons/assessment/AssessmentTypes';

import { ColumnFields, GradingOverview } from './GradingTypes';

export const exportGradingCSV = (gradingOverviews: GradingOverview[] | undefined) => {
  if (!gradingOverviews) return;

  const win = document.defaultView || window;
  if (!win) {
    console.warn('There is no `window` associated with the current `document`');
    return;
  }

  const content = new Blob(
    [
      '"Assessment Number","Assessment Name","Student Name","Student Username","Group","Progress","Question Count","Questions Graded","Initial XP","XP Adjustment","Current XP (excl. bonus)","Max XP","Bonus XP"\n',
      ...gradingOverviews.map(
        e =>
          [
            e.assessmentNumber,
            e.assessmentName,
            e.studentName,
            e.studentUsername,
            e.groupName,
            e.progress,
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

// TODO: Two-way conversion function for frontend-backend parameter conversion
export const convertFilterToBackendParams = (column: ColumnFilter) => {
  switch (column.id) {
    case ColumnFields.assessmentName:
      return { title: column.value };
    case ColumnFields.assessmentType:
      return { type: column.value };
    case ColumnFields.studentName:
      return { name: column.value };
    case ColumnFields.studentUsername:
      return { username: column.value };
    case ColumnFields.progressStatus:
      return progressStatusToBackendParams(column.value as ProgressStatus);
    case ColumnFields.groupName:
      return { groupName: column.value };
    default:
      return {};
  }
};

export const paginationToBackendParams = (page: number, pageSize: number) => {
  return { offset: page * pageSize, pageSize: pageSize };
};

export const unpublishedToBackendParams = (showAll: boolean) => {
  if (showAll) {
    return {};
  }

  return {
    status: AssessmentStatuses.submitted,
    isManuallyGraded: true,
    isGradingPublished: false
  };
};

/**
 * Converts multiple backend parameters into a single comprehensive grading status for use in the grading dashboard.
 * @returns a ProgressStatus, defined within AssessmentTypes, useable by the grading dashboard for display and business logic
 * as well as by the assessment overviews for each student to determine if grading is to be shown
 */
export const backendParamsToProgressStatus = (
  isManuallyGraded: boolean,
  isGradingPublished: boolean,
  submissionStatus: AssessmentStatus,
  numGraded: number,
  numQuestions: number
): ProgressStatus => {
  if (!isManuallyGraded) {
    return ProgressStatuses.autograded;
  } else if (submissionStatus !== AssessmentStatuses.submitted) {
    return submissionStatus;
  } else if (numGraded < numQuestions) {
    return ProgressStatuses.submitted;
  } else if (!isGradingPublished) {
    return ProgressStatuses.graded;
  } else {
    return ProgressStatuses.published;
  }
};

export const progressStatusToBackendParams = (progress: ProgressStatus) => {
  switch (progress) {
    case ProgressStatuses.autograded:
      return {
        isManuallyGraded: false
      };
    case ProgressStatuses.published:
      return {
        isManuallyGraded: true,
        isGradingPublished: true,
        isFullyGraded: true,
        status: AssessmentStatuses.submitted
      };
    case ProgressStatuses.graded:
      return {
        isManuallyGraded: true,
        isGradingPublished: false,
        isFullyGraded: true,
        status: AssessmentStatuses.submitted
      };
    case ProgressStatuses.submitted:
      return {
        isManuallyGraded: true,
        isGradingPublished: false,
        isFullyGraded: false,
        status: AssessmentStatuses.submitted
      };
    default:
      // 'attempted' work may have been previously graded and then unsubmitted
      // thus, isFullyGraded flag is not added
      return {
        isManuallyGraded: true,
        isGradingPublished: false,
        status: progress as AssessmentStatus
      };
  }
};
