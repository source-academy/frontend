import {
  Badge,
  Block,
  Bold,
  Flex,
  List,
  ListItem,
  Metric,
  ProgressBar,
  Text,
  Title
} from '@tremor/react';
import { AssessmentOverview, GradingStatuses } from 'src/commons/assessment/AssessmentTypes';
import { GradingOverview } from 'src/features/grading/GradingTypes';

import { AssessmentTypeBadge } from './GradingStatusBadges';

type GradingSummaryProps = {
  group: string | null;
  submissions: GradingOverview[];
  assessments: AssessmentOverview[];
};

const GradingSummary: React.FC<GradingSummaryProps> = ({ group, submissions, assessments }) => {
  submissions = submissions.filter(({ assessmentType }) => assessmentType !== 'Paths');
  const groupSubmissions = submissions.filter(
    ({ groupName }) => group === null || groupName === group
  );
  const ungraded = groupSubmissions.filter(
    ({ gradingStatus }) => gradingStatus !== GradingStatuses.graded
  );
  const ungradedAssessments = [...new Set(ungraded.map(({ assessmentId }) => assessmentId))]
    .map(assessmentId => {
      const assessment = assessments.find(assessment => assessment.id === assessmentId);
      if (!assessment) throw new Error('Assessment not found');
      return {
        id: assessmentId,
        type: assessment.type,
        title: assessment.title
      };
    })
    .filter(({ type }) => type !== 'Path');

  const numSubmissions = groupSubmissions.length;
  const numGraded = numSubmissions - ungraded.length;
  const percentGraded = Math.round((numGraded / numSubmissions) * 100);

  const numUngradedByAssessment = (assessmentId: number) => {
    return ungraded.filter(({ assessmentId: id }) => id === assessmentId).length;
  };

  return (
    <>
      <Title>My gradings</Title>
      <Flex
        marginTop="mt-4"
        justifyContent="justify-start"
        spaceX="space-x-1"
        alignItems="items-baseline"
      >
        <Metric>{numGraded} </Metric>
        <Text>/ {numSubmissions} graded</Text>
      </Flex>

      <ProgressBar
        percentageValue={percentGraded}
        color={percentGraded < 50 ? 'red' : 'emerald'}
        marginTop="mt-4"
      />
      <Flex marginTop="mt-4">
        <Block>
          <Text>Graded</Text>
          <Text color={percentGraded < 50 ? 'red' : 'emerald'}>
            <Bold>{numGraded}</Bold> ({percentGraded}%)
          </Text>
        </Block>
        <Block>
          <Text textAlignment="text-right">Ungraded</Text>
          <Text textAlignment="text-right">
            <Bold>{numSubmissions - numGraded}</Bold> ({100 - percentGraded}%)
          </Text>
        </Block>
      </Flex>

      <Text marginTop="mt-6">
        <Bold>Ungraded assessments</Bold>
      </Text>
      {ungradedAssessments.length === 0 ? (
        <Text marginTop="mt-4">🎉 Good job! You've graded everything! 🎉</Text>
      ) : (
        <List marginTop="mt-1">
          {ungradedAssessments.map(({ id, title, type }) => (
            <ListItem key={id}>
              <Flex justifyContent="justify-start" spaceX="space-x-1">
                <AssessmentTypeBadge type={type} size="xs" />
                <span>{title}</span>
                <Badge size="xs" color="red" text={numUngradedByAssessment(id).toString()} />
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

export default GradingSummary;
