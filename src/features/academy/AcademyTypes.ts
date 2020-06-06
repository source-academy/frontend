export const SAVE_CANVAS = 'SAVE_CANVAS';

export const assessmentRegExp = ':assessmentId(\\d+)?/:questionId(\\d+)?';
export const gradingRegExp = ':submissionId(\\d+)?/:questionId(\\d+)?';

export type AcademyState = {
  readonly gameCanvas?: HTMLCanvasElement;
};
