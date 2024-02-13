import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon, NonIdealState, Position, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Card, Col, ColGrid, Flex, Text, Title } from '@tremor/react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams} from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import { GradingStatuses } from 'src/commons/assessment/AssessmentTypes';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import { exportGradingCSV, isSubmissionUngraded } from 'src/features/grading/GradingUtils';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingSubmissionsTable from './subcomponents/GradingSubmissionsTable';
import GradingSummary from './subcomponents/GradingSummary';
import GradingWorkspace from './subcomponents/GradingWorkspace';

const Grading: React.FC = () => {
  const {
    courseId,
    gradingOverviews,
    role,
    group,
    assessmentOverviews: assessments = []
  } = useSession();
  const params = useParams<{
    submissionId: string;
    questionId: string;
  }>();

  const isAdmin = role === Role.Admin;
  const [showAllGroups, setShowAllGroups] = useState(isAdmin || group === null);
  const groupOptions = [
    { value: false, label: 'my groups' },
    { value: true, label: 'all groups' }
  ];

  const dispatch = useDispatch();
  /**Passed as a prop to submissions table sub-component for sub-component to feed pagination and filter logic.*/
  // TEMPORARY IMPLEMENTATION. TODO: Refactor into a filters type once proof of feature is complete.
  const updateGradingOverviewsCallback = (group: boolean, pageParams: any, filterParams: any) => {
    dispatch(fetchGradingOverviews(false, pageParams, filterParams));
  }

  /**Initializes grading submissions table with default values.
   * useEffect ensures that initialization is run only once component is mounted.
   */
  // TEMPORARY IMPLEMENTATION. TODO: Refactor into a filters type once proof of feature is complete.
  useEffect(() => {
    dispatch(fetchGradingOverviews(false, {offset: 0, pageSize: 10}, {}));
  }, [dispatch]);


  const [showAllSubmissions, setShowAllSubmissions] = useState(true);
  const showOptions = [
    { value: false, label: 'ungraded' },
    { value: true, label: 'all' }
  ];

  // If submissionId or questionId is defined but not numeric, redirect back to the Grading overviews page
  if (
    (params.submissionId && !params.submissionId?.match(numberRegExp)) ||
    (params.questionId && !params.questionId?.match(numberRegExp))
  ) {
    return <Navigate to={`/courses/${courseId}/grading`} />;
  }

  const submissionId: number | null = convertParamToInt(params.submissionId);
  // default questionId is 0 (the first question)
  const questionId: number = convertParamToInt(params.questionId) || 0;

  /* Create a workspace to grade a submission. */
  if (submissionId !== null) {
    return <GradingWorkspace questionId={questionId} submissionId={submissionId} />;
  }

  /* Display either a loading screen or a table with overviews. */
  const loadingDisplay = (
    <NonIdealState
      className="Grading"
      description="Fetching submissions..."
      icon={<Spinner size={SpinnerSize.LARGE} />}
    />
  );

  const submissions =
    gradingOverviews?.data?.map(e =>
      !e.studentName ? { ...e, studentName: '(user has yet to log in)' } : e
    ) ?? [];

  return (
    <ContentDisplay
      display={
        gradingOverviews?.data === undefined ? (
          loadingDisplay
        ) : (
          <ColGrid numColsLg={8} gapX="gap-x-4" gapY="gap-y-2">
            <Col numColSpanLg={6}>
              <Card>
                <Flex justifyContent="justify-between">
                  <Flex justifyContent="justify-start" spaceX="space-x-6">
                    <Title>Submissions</Title>
                    <Button
                      variant="light"
                      size="xs"
                      icon={() => (
                        <BpIcon icon={IconNames.EXPORT} style={{ marginRight: '0.5rem' }} />
                      )}
                      onClick={() => exportGradingCSV(gradingOverviews.data)}
                    >
                      Export to CSV
                    </Button>
                  </Flex>
                </Flex>
                <Flex justifyContent="justify-start" marginTop="mt-2" spaceX="space-x-2">
                  <Text>Viewing</Text>
                  <SimpleDropdown
                    options={showOptions}
                    selectedValue={showAllSubmissions}
                    onClick={setShowAllSubmissions}
                    popoverProps={{ position: Position.BOTTOM }}
                    buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
                  />
                  <Text>submissions from</Text>
                  <SimpleDropdown
                    options={groupOptions}
                    selectedValue={showAllGroups}
                    onClick={setShowAllGroups}
                    popoverProps={{ position: Position.BOTTOM }}
                    buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
                  />
                </Flex>
                <GradingSubmissionsTable
                  totalRows={gradingOverviews.count}
                  submissions={submissions.filter(
                    s => showAllSubmissions || isSubmissionUngraded(s)
                  )}
                  updateEntries={updateGradingOverviewsCallback}
                />
              </Card>
            </Col>

            <Col numColSpanLg={2}>
              <Card hFull>
                <GradingSummary
                  // Only include submissions from the same group in the summary
                  submissions={submissions.filter(
                    ({ groupName, gradingStatus }) =>
                      groupName === group && gradingStatus !== GradingStatuses.excluded
                  )}
                  assessments={assessments}
                />
              </Card>
            </Col>
          </ColGrid>
        )
      }
      fullWidth={true}
    />
  );
};

export default Grading;
