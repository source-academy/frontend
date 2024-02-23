export const numberRegExp = /^-?\d+$/;

// Full assessment path: /courses/:courseId/:assessmentType/:assessmentId?/:questionId?
export const assessmentFullPathRegex = /\/courses\/\d+\/[a-zA-Z]+\/\d+\/\d+/;
export const assessmentRegExp = ':assessmentId?/:questionId?';

export const gradingRegExp = ':submissionId?/:questionId?';

export const CREATE_COURSE = 'CREATE_COURSE';
export const ADD_NEW_USERS_TO_COURSE = 'ADD_NEW_USERS_TO_COURSE';
export const ADD_NEW_STORIES_USERS_TO_COURSE = 'ADD_STORIES_NEW_USERS_TO_COURSE';

export type AcademyState = {
  // readonly gameCanvas?: HTMLCanvasElement;
};
