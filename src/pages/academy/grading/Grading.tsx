import { Button, Icon, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { parseAsBoolean, parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { getAllGradingOverviews } from 'src/commons/sagas/RequestsSaga';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useAppSelector, useSession } from 'src/commons/utils/Hooks';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import { exportGradingCSV } from 'src/features/grading/GradingUtils';
import { queries } from 'src/queryKeys';

import ContentDisplay from '../../../commons/ContentDisplay';
import { convertParamToInt } from '../../../commons/utils/ParamParseHelper';
import GradingSubmissionsTable from './subcomponents/GradingSubmissionsTable';
import GradingWorkspace from './subcomponents/GradingWorkspace';

const groupOptions = [
  { value: true, label: 'my groups' },
  { value: false, label: 'all groups' },
];

const showOptions = [
  { value: false, label: 'unpublished' },
  { value: true, label: 'all' },
];

const pageSizeOptions = [
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
];

function Grading() {
  const { courseId, role, group } = useSession();
  const params = useParams<{ submissionId: string; questionId: string }>();

  const isAdmin = role === Role.Admin;
  const [showUserGroups, setShowUserGroups] = useQueryState(
    'myGroups',
    parseAsBoolean.withDefault(!isAdmin && group !== null),
  );

  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));
  const [showAllSubmissions, setShowAllSubmissions] = useQueryState(
    'showAll',
    parseAsBoolean.withDefault(false),
  );
  const [animateRefresh, setAnimateRefresh] = useState(false); // for animation (becomes false on animation end)

  const accessToken = useAppSelector(state => state.session.accessToken);
  const refreshToken = useAppSelector(state => state.session.refreshToken);

  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: queries.grading.overviews._def }) > 0;

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

  return (
    <ContentDisplay
      display={
        <div className="grading-table-wrapper">
          <GradingFlex justifyContent="space-between">
            <GradingFlex justifyContent="flex-start" style={{ columnGap: '1.5rem' }}>
              <GradingText style={{ fontSize: '1.125rem', opacity: 0.9 }}>Submissions</GradingText>
              <Button
                variant="minimal"
                icon={IconNames.EXPORT}
                onClick={() => {
                  const tokens = {
                    accessToken: accessToken!,
                    refreshToken: refreshToken!,
                  };
                  getAllGradingOverviews(tokens).then(resp => exportGradingCSV(resp?.data));
                }}
                className="export-csv-btn"
              >
                Export to CSV
              </Button>
            </GradingFlex>
          </GradingFlex>
          <GradingFlex
            justifyContent="flex-start"
            style={{ columnGap: '0.5rem', marginTop: '0.5rem' }}
          >
            <GradingText>Viewing</GradingText>
            <SimpleDropdown
              options={showOptions}
              selectedValue={showAllSubmissions}
              onClick={setShowAllSubmissions}
              popoverProps={{ position: Position.BOTTOM }}
              buttonProps={{ variant: 'minimal', endIcon: 'caret-down' }}
            />
            <GradingText>submissions from</GradingText>
            <SimpleDropdown
              options={groupOptions}
              selectedValue={showUserGroups}
              onClick={setShowUserGroups}
              popoverProps={{ position: Position.BOTTOM }}
              buttonProps={{ variant: 'minimal', endIcon: 'caret-down' }}
            />
            <GradingText>showing</GradingText>
            <SimpleDropdown
              options={pageSizeOptions}
              selectedValue={pageSize}
              onClick={setPageSize}
              popoverProps={{ position: Position.BOTTOM }}
              buttonProps={{ variant: 'minimal', endIcon: 'caret-down' }}
            />
            <GradingText>entries per page.</GradingText>
            <Button
              className={animateRefresh ? 'grading-refresh-loop' : ''}
              variant="minimal"
              style={{ padding: 0 }}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: queries.grading.overviews._def });
                setAnimateRefresh(true);
              }}
              onAnimationEnd={() => setAnimateRefresh(false)}
              disabled={isFetching}
            >
              <Icon htmlTitle="Refresh" icon={IconNames.REFRESH} />
            </Button>
          </GradingFlex>
          <GradingSubmissionsTable
            showUserGroups={showUserGroups}
            showAllSubmissions={showAllSubmissions}
            pageSize={pageSize}
          />
        </div>
      }
      fullWidth
    />
  );
}

export const Component = Grading;

export default Grading;
