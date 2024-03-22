import { ColumnFilter } from '@tanstack/react-table';
import { AssessmentStatus, AssessmentStatuses, GradingStatus, GradingStatuses, ProgressStatus, ProgressStatuses, SubmissionProgress, SubmissionProgresses } from 'src/commons/assessment/AssessmentTypes';

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

// TODO: Two-way conversion function for frontend-backend parameter conversion
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
    case 'progress':
      return progressStatusToBackendParams(column.value as ProgressStatus);
    case 'groupName':
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
    status: SubmissionProgresses.submitted,
    notPublished: true
  };
};

/**
 * Converts multiple backend parameters into a single comprehensive grading status for use in the grading dashboard. 
 * @param isPublished backend field denoting if grading of submitted work is to be shown to the student
 * @param submissionStatus backend field denoting if the student has submitted their work.
 * @param numGraded
 * @param numQuestions 
 * @returns a ProgressStatus, defined within AssessmentTypes, useable by the grading dashboard for display and business logic.
 */
export const backendParamsToProgressStatus = (
  isPublished: boolean,
  submissionStatus: AssessmentStatus,
  numGraded: number,
  numQuestions: number
): ProgressStatus => {
  // Devnote: Make sure that computeProgress is one-to-one such that each ProgressStatus can be mapped back to its backend parameters.
  // this allows pagination to be done fully in the backend using the progressToBackendParams function.
  if (submissionStatus !== AssessmentStatuses.submitted) {
    // derived ProgressStatus follows a 1-to-1 correspondence with backend "status" if status != submitted
    return submissionStatus as ProgressStatus;
  } else if (numGraded < numQuestions) {
    return ProgressStatuses.submitted;
  } else if (!isPublished) {
    return ProgressStatuses.graded;
  } else {
    return ProgressStatuses.published;
  }
}

export const progressStatusToBackendParams = (
  progress: ProgressStatus
) => {
  switch (progress) {
    case ProgressStatuses.published:
      return { 
        notPublished: 44,
        notFullyGraded: false,
        status: AssessmentStatuses.submitted
      };
    case ProgressStatuses.graded:
      return { 
        notPublished: true,
        notFullyGraded: false,
        status: AssessmentStatuses.submitted
      };
    default:
      return { 
        notPublished: true,
        notFullyGraded: true,
        status: progress as AssessmentStatus 
      };
  }
}

export const computeGradingStatus = (
  isManuallyGraded: boolean,
  submissionStatus: SubmissionProgress,
  numGraded: number,
  numQuestions: number
): GradingStatus =>
  // isGraded refers to whether the assessment type is graded or not, as specified in
  // the respective assessment configuration
  isManuallyGraded && submissionStatus === SubmissionProgresses.submitted
    ? numGraded === 0
      ? GradingStatuses.none
      : numGraded === numQuestions
      ? GradingStatuses.graded
      : GradingStatuses.grading
    : GradingStatuses.excluded;

export const computeSubmissionProgress = (
  submissionStatus: AssessmentStatus,
  isPublished: boolean
): SubmissionProgress =>
  submissionStatus === SubmissionProgresses.submitted && isPublished
    ? SubmissionProgresses.published
    : submissionStatus;