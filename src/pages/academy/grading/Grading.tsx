import { Button, Icon, NonIdealState, Position, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useSession, useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { numberRegExp } from 'src/features/academy/AcademyTypes';
import { GradingOverview } from 'src/features/grading/GradingTypes';
import {
  exportGradingCSV,
  paginationToBackendParams,
  unpublishedToBackendParams
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
  { value: false, label: 'unpublished' },
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
  const [refreshQueryData, setRefreshQueryData] = useState({ page: 1, filterParams: {} });
  const [refreshQueried, setRefreshQueried] = useState(false); // for callback (immediately becomes false)
  const [animateRefresh, setAnimateRefresh] = useState(false); // for animation (becomes false on animation end)
  const [submissions, setSubmissions] = useState<GradingOverview[]>([]);

  const dispatch = useDispatch();
  const allColsSortStates = useTypedSelector(state => state.workspaces.grading.allColsSortStates);
  const hasLoadedBefore = useTypedSelector(state => state.workspaces.grading.hasLoadedBefore);

  const updateGradingOverviewsCallback = useCallback(
    (page: number, filterParams: object) => {
      setRefreshQueryData({ page, filterParams });
      dispatch(WorkspaceActions.setGradingHasLoadedBefore());
      dispatch(WorkspaceActions.increaseRequestCounter());
      dispatch(
        SessionActions.fetchGradingOverviews(
          !showAllGroups,
          unpublishedToBackendParams(showAllSubmissions),
          paginationToBackendParams(page, pageSize),
          filterParams,
          allColsSortStates
        )
      );
    },
    [dispatch, showAllGroups, showAllSubmissions, pageSize, allColsSortStates]
  );

  useEffect(() => {
    if (refreshQueried) {
      dispatch(WorkspaceActions.increaseRequestCounter());
      dispatch(
        SessionActions.fetchGradingOverviews(
          showAllGroups,
          unpublishedToBackendParams(showAllSubmissions),
          paginationToBackendParams(refreshQueryData.page, pageSize),
          refreshQueryData.filterParams,
          allColsSortStates
        )
      );
      setRefreshQueried(false);
    }
  }, [
    dispatch,
    showAllGroups,
    showAllSubmissions,
    pageSize,
    allColsSortStates,
    refreshQueried,
    refreshQueryData
  ]);

  useEffect(() => {
    setSubmissions(
      gradingOverviews?.data?.map(e =>
        !e.studentName
          ? {
              ...e,
              studentName: Array.isArray(e.studentNames)
                ? e.studentNames.join(', ')
                : e.studentNames
            }
          : e
      ) ?? []
    );
    dispatch(WorkspaceActions.decreaseRequestCounter());
  }, [gradingOverviews, dispatch]);

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

  return (
    <ContentDisplay
      loadContentDispatch={() => {
        if (!hasLoadedBefore) {
          dispatch(SessionActions.fetchGradingOverviews(showAllGroups));
        }
      }}
      display={
        gradingOverviews?.data === undefined ? (
          loadingDisplay
        ) : (
          <div className="grading-table-wrapper">
            <GradingFlex justifyContent="space-between">
              <GradingFlex justifyContent="flex-start" style={{ columnGap: '1.5rem' }}>
                <GradingText style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                  Submissions
                </GradingText>
                <Button
                  minimal
                  icon={IconNames.EXPORT}
                  onClick={() => exportGradingCSV(gradingOverviews.data)}
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
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <GradingText>submissions from</GradingText>
              <SimpleDropdown
                options={groupOptions}
                selectedValue={showAllGroups}
                onClick={setShowAllGroups}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <GradingText>showing</GradingText>
              <SimpleDropdown
                options={pageSizeOptions}
                selectedValue={pageSize}
                onClick={setPageSize}
                popoverProps={{ position: Position.BOTTOM }}
                buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
              />
              <GradingText>entries per page.</GradingText>
              <Button
                className={animateRefresh ? 'grading-refresh-loop' : ''}
                minimal
                style={{ padding: 0 }}
                onClick={e => {
                  setRefreshQueried(true);
                  setAnimateRefresh(true);
                }}
                onAnimationEnd={e => setAnimateRefresh(false)}
              >
                <Icon htmlTitle="Refresh" icon={IconNames.REFRESH} />
              </Button>
            </GradingFlex>
            <GradingSubmissionsTable
              showAllSubmissions={showAllSubmissions}
              totalRows={gradingOverviews.count}
              pageSize={pageSize}
              submissions={submissions}
              updateEntries={updateGradingOverviewsCallback}
            />
          </div>
        )
      }
      fullWidth
    />
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Grading;
Component.displayName = 'Grading';

export default Grading;
