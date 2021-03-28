export type BooleanExpression = AndExpression | OrExpression | Conditional | false;

interface AndExpression {
  type: 'AND';
  operands: BooleanExpression[];
}

interface OrExpression {
  type: 'OR';
  operands: BooleanExpression[];
}

type Conditional =
  | AchievementConditional
  | AssessmentGradingConditional
  | AssessmentSubmissionConditional
  | GenericConditional;

export enum EventTypes {
  ACHIEVEMENT = 'achievement',
  ASSESSMENT_GRADING = 'assessment-grading',
  ASSESSMENT_SUBMISSION = 'assessment-submission'
}

interface ConditionalBase {
  event: EventTypes;
}

interface GenericConditional extends ConditionalBase {
  condition?: (evt: any) => boolean;
  restriction?: string;
}

interface AchievementConditional extends ConditionalBase {
  event: EventTypes.ACHIEVEMENT;
  restriction: string;
}

interface AssessmentGradingConditional extends ConditionalBase {
  event: EventTypes.ASSESSMENT_GRADING;
  restriction: string;
}

interface AssessmentSubmissionConditional extends ConditionalBase {
  event: EventTypes.ASSESSMENT_SUBMISSION;
  restriction: string;
}

export function AND(...operands: BooleanExpression[]): BooleanExpression {
  return {
    type: 'AND',
    operands
  };
}

export function OR(...operands: BooleanExpression[]): BooleanExpression {
  return {
    type: 'OR',
    operands
  };
}
