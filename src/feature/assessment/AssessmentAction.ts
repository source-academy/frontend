import { action } from 'typesafe-actions';
import { FETCH_ASSESSMENT_OVERVIEWS, SUBMIT_ASSESSMENT } from './AssessmentTypes';

export const fetchAssessmentOverviews = () => action(FETCH_ASSESSMENT_OVERVIEWS);

export const submitAssessment = (id: number) => action(SUBMIT_ASSESSMENT, id);
