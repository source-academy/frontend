import { action } from 'typesafe-actions';
import { FETCH_ASSESSMENT_OVERVIEWS } from '../assessment/AssessmentTypes'

export const fetchAssessmentOverviews = () => action(FETCH_ASSESSMENT_OVERVIEWS);
