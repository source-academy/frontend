import '@tremor/react/dist/esm/tremor.css';

import { Button, Card, Col, ColGrid, Flex, Title, Toggle, ToggleItem } from '@tremor/react';
import { useState } from 'react';
import { GradingStatuses } from 'src/commons/assessment/AssessmentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { GradingOverview } from 'src/features/grading/GradingTypes';

import GradingSubmissionsTable from './GradingSubmissionsTable';
import GradingSummary from './GradingSummary';

type GradingDashboardProps = {
  submissions: GradingOverview[];
  handleCsvExport: () => void;
};

const GradingDashboard: React.FC<GradingDashboardProps> = ({ submissions, handleCsvExport }) => {
  const group = useTypedSelector(state => state.session.group);
  const assessments = useTypedSelector(state => state.session.assessmentOverviews) || [];

  const [showGraded, setShowGraded] = useState(false);

  const ungraded = submissions.filter(
    submission =>
      !(
        submission.submissionStatus === 'submitted' &&
        submission.gradingStatus === GradingStatuses.graded
      )
  );
  const submissionsData = showGraded ? submissions : ungraded;

  const handleShowGradedChange = (shouldShowGraded: boolean) => {
    setShowGraded(shouldShowGraded);
  };

  return (
    <ColGrid numColsLg={8} gapX="gap-x-4" gapY="gap-y-2">
      <Col numColSpanLg={6}>
        <Card>
          <Flex justifyContent="justify-between">
            <Title>Submissions</Title>
            <Button onClick={handleCsvExport}>Export to CSV</Button>
            <Toggle color="gray" defaultValue={false} handleSelect={handleShowGradedChange}>
              <ToggleItem value={false} text="Ungraded" />
              <ToggleItem value={true} text="All" />
            </Toggle>
          </Flex>
          <GradingSubmissionsTable group={group} submissions={submissionsData} />
        </Card>
      </Col>

      <Col numColSpanLg={2}>
        <Card hFull>
          <GradingSummary group={group} submissions={submissions} assessments={assessments} />
        </Card>
      </Col>
    </ColGrid>
  );
};

export default GradingDashboard;
