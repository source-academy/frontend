import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon, NonIdealState, Position, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Card, Flex, Text, Title } from '@tremor/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import { exportGradingCSV } from 'src/features/grading/GradingUtils';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingSubmissionsTable from './subcomponents/GradingSubmissionsTable';
import GradingWorkspace from './subcomponents/GradingWorkspace';

const Grading: React.FC = () => {
  const { courseId, gradingOverviews } = useSession();
  const params = useParams<{
    submissionId: string;
    questionId: string;
  }>();

  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const showSubmissionOptions = [
    { value: false, label: 'ungraded' },
    { value: true, label: 'all' }
  ];

  // TODO: implement isAdmin functionality
  const [limitGroup, setLimitGroup] = useState(true);
  const groupOptions = [
    { value: true, label: 'my groups' },
    { value: false, label: 'all groups' }
  ];

  // Dropdown tab options, which contains some external state.
  // This can be a candidate for its own component once backend feature implementation is complete.
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  const dispatch = useDispatch();
  const updateGradingOverviewsCallback = useCallback(
    (pageParams: { offset: number; pageSize: number }, filterParams: Object) => {
      dispatch(fetchGradingOverviews(limitGroup, pageParams, filterParams));
    },
    [dispatch, limitGroup]
  );

  // Default value initializer
  useEffect(() => {
    dispatch(fetchGradingOverviews());
  }, [dispatch]);

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
          <Card>
            <Flex justifyContent="justify-between">
              <Flex justifyContent="justify-start" spaceX="space-x-6">
                <Title>Submissions</Title>
                <Button
                  variant="light"
                  size="xs"
                  icon={() => <BpIcon icon={IconNames.EXPORT} style={{ marginRight: '0.5rem' }} />}
                  onClick={() => exportGradingCSV(gradingOverviews.data)}
                >
                  Export to CSV
                </Button>
              </Flex>
            </Flex>
            <Flex justifyContent="justify-start" marginTop="mt-2" spaceX="space-x-2">
              <Text>Viewing</Text>
              <SimpleDropdown
                options={showSubmissionOptions}
                selectedValue={showAllSubmissions}
                onClick={setShowAllSubmissions}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <Text>submissions from</Text>
              <SimpleDropdown
                options={groupOptions}
                selectedValue={limitGroup}
                onClick={setLimitGroup}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <Text>Entries per page</Text>
              <SimpleDropdown
                options={pageSizeOptions}
                selectedValue={pageSize}
                onClick={setPageSize}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
            </Flex>
            <GradingSubmissionsTable
              totalRows={gradingOverviews.count}
              pageSize={pageSize}
              submissions={submissions}
              updateEntries={updateGradingOverviewsCallback}
            />
          </Card>
        )
      }
      fullWidth={true}
    />
  );
};

export default Grading;
