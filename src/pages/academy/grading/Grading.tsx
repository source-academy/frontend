import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon, NonIdealState, Position, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Card, Flex, Text, Title } from '@tremor/react';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import {
  exportGradingCSV,
  paginationToBackendParams,
  ungradedToBackendParams
} from 'src/features/grading/GradingUtils';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingSubmissionsTable from './subcomponents/GradingSubmissionsTable';
import GradingWorkspace from './subcomponents/GradingWorkspace';

const groupOptions = [
  { value: false, label: 'my groups' },
  { value: true, label: 'all groups' }
];

const showOptions = [
  { value: false, label: 'ungraded' },
  { value: true, label: 'all' }
];

const pageSizeOptions = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' }
];

const Grading: React.FC = () => {
  const { courseId, gradingOverviews, role, group } = useSession();
  const params = useParams<{ submissionId: string; questionId: string }>();

  const isAdmin = role === Role.Admin;
  const [showAllGroups, setShowAllGroups] = useState(isAdmin || group === null);

  const [pageSize, setPageSize] = useState(10);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);

  const dispatch = useDispatch();
  const updateGradingOverviewsCallback = useCallback(
    (page: number, filterParams: Object) => {
      dispatch(
        fetchGradingOverviews(
          showAllGroups,
          ungradedToBackendParams(showAllSubmissions),
          paginationToBackendParams(page, pageSize),
          filterParams
        )
      );
    },
    [dispatch, showAllGroups, showAllSubmissions, pageSize]
  );

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
      loadContentDispatch={() => dispatch(fetchGradingOverviews(showAllGroups))}
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
              <Text>showing</Text>
              <SimpleDropdown
                options={pageSizeOptions}
                selectedValue={pageSize}
                onClick={setPageSize}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <Text>entries per page.</Text>
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
