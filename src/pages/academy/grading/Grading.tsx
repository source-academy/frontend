import { Button, Icon, NonIdealState, Position, Spinner, SpinnerSize } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { Role } from 'src/commons/application/ApplicationTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import SimpleDropdown from 'src/commons/SimpleDropdown';
// import { useSession } from 'src/commons/utils/Hooks';
import { useSession, useTypedSelector } from 'src/commons/utils/Hooks';
import { decreaseRequestCounter, increaseRequestCounter } from 'src/commons/workspace/WorkspaceActions';
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
  const [refreshQuery, setRefreshQuery] = useState(false);

  const dispatch = useDispatch();
  const allColsSortStates = useTypedSelector(state => state.workspaces.grading.allColsSortStates);
  const requestCounter = useTypedSelector(state => state.workspaces.grading.requestCounter);

  const updateGradingOverviewsCallback = useCallback(
    (page: number, filterParams: Object) => {
      if (refreshQuery) { // Prevents es-lint missing dependency warning
        return setRefreshQuery(false);
      }
      dispatch(increaseRequestCounter());
      dispatch(
        fetchGradingOverviews(
          showAllGroups,
          ungradedToBackendParams(showAllSubmissions),
          paginationToBackendParams(page, pageSize),
          filterParams,
          allColsSortStates,
        )
      );
    },
    [dispatch, showAllGroups, showAllSubmissions, pageSize, allColsSortStates, refreshQuery]
  );

  // useEffect(() => {
  //   console.log(sortStates);
  // }, [sortStates]);

  useEffect(() => {
    dispatch(decreaseRequestCounter());
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
          <GradingFlex flexDirection="column" className="grading-table-wrapper">
            <GradingFlex justifyContent="justify-between">
              <GradingFlex justifyContent="justify-start" style={{columnGap: "1.5rem"}}>
                <GradingText style={{fontSize: "1.125rem", opacity: 0.9}}>Submissions</GradingText>
                <Button 
                  minimal={true}
                  icon={IconNames.EXPORT}
                  onClick={() => exportGradingCSV(gradingOverviews.data)}
                  className="export-csv-btn"
                >
                  Export to CSV
                </Button>
              </GradingFlex>
            </GradingFlex>
            <GradingFlex justifyContent="justify-start" style={{columnGap: "0.5rem", marginTop: "0.5rem"}}>
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
              <Button className={"grading-refresh" + (requestCounter !== 0 ? "-loop" : "") } minimal={true} style={{ padding: 0 }} onClick={(e) => setRefreshQuery((prev) => !prev)}>
                <Icon htmlTitle="Refresh" icon={IconNames.REFRESH} />
              </Button>
            </GradingFlex>
            <GradingSubmissionsTable
              totalRows={gradingOverviews.count}
              pageSize={pageSize}
              submissions={submissions}
              updateEntries={updateGradingOverviewsCallback}
            />
          </GradingFlex>
        )
      }
      fullWidth={true}
    />
  );
};

export default Grading;
