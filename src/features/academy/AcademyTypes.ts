export const SAVE_CANVAS = 'SAVE_CANVAS';

export const assessmentRegExp = ':assessmentId(\\d+)?/:questionId(\\d+)?';
export const gradingRegExp = ':submissionId(\\d+)?/:questionId(\\d+)?';

export const ADD_NEW_USERS_TO_COURSE = 'ADD_NEW_USERS_TO_COURSE';

export type AcademyState = {
  readonly gameCanvas?: HTMLCanvasElement;
};
