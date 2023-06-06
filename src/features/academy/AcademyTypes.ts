export const SAVE_CANVAS = 'SAVE_CANVAS';

export const numberRegExp = /^-?\d+$/;

export const assessmentRegExp = ':assessmentId?/:questionId?';
export const gradingRegExp = ':submissionId?/:questionId?';

export const CREATE_COURSE = 'CREATE_COURSE';
export const ADD_NEW_USERS_TO_COURSE = 'ADD_NEW_USERS_TO_COURSE';

export type AcademyState = {
  readonly gameCanvas?: HTMLCanvasElement;
};
