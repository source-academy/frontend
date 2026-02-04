export const numberRegExp = /^-?\d+$/;

// Full assessment path: /courses/:courseId/:assessmentType/:assessmentId?/:questionId?
export const assessmentFullPathRegex = /\/courses\/\d+\/[a-zA-Z]+\/\d+\/\d+/;
export const assessmentRegExp = ':assessmentId?/:questionId?';

export const gradingRegExp = ':submissionId?/:questionId?';
export const teamRegExp = ':teamId?';
