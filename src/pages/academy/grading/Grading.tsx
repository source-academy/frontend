import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon, NonIdealState, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Card, Flex, Title } from '@tremor/react';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
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

  const dispatch = useDispatch();
  const updateGradingOverviewsCallback = useCallback(
    (group: boolean, pageParams: { offset: number; pageSize: number }, filterParams: Object) => {
      dispatch(fetchGradingOverviews(group, pageParams, filterParams));
    },
    [dispatch]
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
            <GradingSubmissionsTable
              totalRows={gradingOverviews.count}
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
