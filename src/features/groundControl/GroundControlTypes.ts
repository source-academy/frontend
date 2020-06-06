import { AssessmentOverview } from '../../commons/assessment/AssessmentTypes';

export const CHANGE_DATE_ASSESSMENT = 'CHANGE_DATE_ASSESSMENT';
export const DELETE_ASSESSMENT = 'DELETE_ASSESSMENT';
export const PUBLISH_ASSESSMENT = 'PUBLISH_ASSESSMENT';
export const UPLOAD_ASSESSMENT = 'UPLOAD_ASSESSMENT';

export interface IGroundControlAssessmentOverview extends AssessmentOverview {
    prettyOpenAt: string;
    prettyCloseAt: string;
    formattedOpenAt: Date;
    formattedCloseAt: Date;
}
