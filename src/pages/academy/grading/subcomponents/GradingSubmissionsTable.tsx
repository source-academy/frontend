import { Button, H6, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { CellClickedEvent, ColDef } from 'ag-grid-community';
import { AgGridReact, type CustomHeaderProps } from 'ag-grid-react';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import ColumnHeader from 'src/commons/agGrid/ColumnHeader';
import HiddenColumnsBar from 'src/commons/agGrid/HiddenColumnsBar';
import { themeSource } from 'src/commons/agGrid/theme';
import { useColumnVisibility } from 'src/commons/agGrid/useColumnVisibility';
import { ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import type {
  ColumnFieldsKeys,
  ColumnFilter,
  GradingOverview,
  IGradingTableProperties,
  IGradingTableRow,
  SortStateProperties,
} from 'src/features/grading/GradingTypes';
import { ColumnFields, ColumnName, SortStates } from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';

import classes from '../Grading.module.css';
import { useGradingTableParams } from '../useGradingTableParams';
import { getBadgeColorFromLabel } from './gradingBadges/gradingBadgeColors';
import GradingSortIcon from './GradingSortIcon';
import GradingSubmissionFilters from './GradingSubmissionFilters';
import { generateCols } from './gradingSubmissionsTableUtils';

export const getNextSortState = (current: SortStates) => {
  switch (current) {
    case SortStates.NONE:
      return SortStates.ASC;
    case SortStates.ASC:
      return SortStates.DESC;
    case SortStates.DESC:
      return SortStates.NONE;
  }
};

export const freshSortState: SortStateProperties = {
  assessmentName: SortStates.NONE,
  assessmentType: SortStates.NONE,
  studentName: SortStates.NONE,
  studentUsername: SortStates.NONE,
  groupName: SortStates.NONE,
  progressStatus: SortStates.NONE,
  xp: SortStates.NONE,
  actionsIndex: SortStates.NONE,
};

const disabledEditModeCols: string[] = [ColumnFields.actionsIndex];

const disabledFilterModeCols: string[] = [ColumnFields.xp, ColumnFields.actionsIndex];

const disabledSortCols: string[] = [ColumnFields.actionsIndex];

type Props = {
  showAllSubmissions: boolean;
  totalRows: number;
  pageSize: number;
  submissions: GradingOverview[];
  updateEntries: (page: number, filterParams: object) => void;
};

const HEADER_HEIGHT: number = 48; // in px, declared here to calculate table height
const PAGE_CHANGE_DEBOUNCE_MS = 500; // debounce to allow for page skipping

function GradingSubmissionTable({
  showAllSubmissions,
  totalRows,
  pageSize,
  submissions,
  updateEntries,
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const requestCounter = useAppSelector(state => state.workspaces.grading.requestCounter);
  const courseId = useAppSelector(store => store.session.courseId);

  const gridRef = useRef<AgGridReact<IGradingTableRow>>(null);

  const { page, setPage, columnFilters, setColumnFilters } = useGradingTableParams();
  // `pendingPage` is shown in the navigator immediately,
  // but actual `page` is fetched once debounce time up
  const [pendingPage, setPendingPage] = useState(page);
  const [fetchedPage, setFetchedPage] = useState(page);
  const [cellFilters, setCellFilters] = useState<{ id: ColumnFields; value: string }[]>([]);
  const columnVisibility = useColumnVisibility({
    getColumnLabel: id => ColumnName[id as ColumnFieldsKeys],
  });
  const [rowData, setRowData] = useState<IGradingTableRow[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<IGradingTableRow>[]>();
  // This is what that controls Grading Mode. If future feedback says it's better to default to filter mode, change it here.
  const [filterMode, setFilterMode] = useState<boolean>(false);

  const isLoading = useMemo(() => requestCounter > 0, [requestCounter]);
  const isPageChangePending = pendingPage !== fetchedPage;

  const maxPage = useMemo(() => Math.ceil(totalRows / pageSize) - 1, [totalRows, pageSize]);
  const debouncedSetPage = useMemo(() => debounce(setPage, PAGE_CHANGE_DEBOUNCE_MS), [setPage]);

  const goToPage = (newPage: number) => {
    if (isLoading) {
      return;
    }
    setPendingPage(newPage);
    debouncedSetPage(newPage);
  };

  const loadingNavButtonProps = isLoading
    ? {
        'aria-disabled': true,
        className: 'cursor-not-allowed! hover:bg-transparent active:bg-transparent',
      }
    : {};

  useEffect(() => () => debouncedSetPage.cancel(), [debouncedSetPage]);

  // ensure only one request in flight
  useEffect(() => {
    if (isLoading && pendingPage !== page) {
      debouncedSetPage.cancel();
      setPendingPage(page);
    }
  }, [isLoading, pendingPage, page, debouncedSetPage]);

  const defaultColumnDefs: ColDef = {
    filter: false,
    floatingFilter: true,
    resizable: true,
    sortable: true,
    headerComponentParams: {
      ...columnVisibility.headerProps,
      hideDisabledCols: [],
      extraActions: (headerProps: CustomHeaderProps) =>
        disabledSortCols.includes(headerProps.column.getColId()) ? null : (
          <GradingSortIcon headerProps={headerProps} />
        ),
    },
  };

  const tableProperties: IGradingTableProperties = {
    customComponents: {
      agColumnHeader: ColumnHeader,
    },
    defaultColDefs: defaultColumnDefs,
    headerHeight: HEADER_HEIGHT,
    overlayLoadingTemplate: '<div class="grading-loading-icon"></div>',
    overlayNoRowsTemplate:
      "Hmm... we didn't find any submissions, you might want to debug your filter() function.",
    pageSize: pageSize,
    pagination: true,
    suppressMenuHide: true,
    suppressPaginationPanel: true,
  };

  const debouncedUpdateCellFilters = useMemo(() => debounce(setCellFilters, 300), []);

  // Converts the columnFilters array into backend query parameters.
  const backendFilterParams = useMemo(() => {
    const filters: Array<{ [key: string]: any }> = [...columnFilters, ...cellFilters].map(
      convertFilterToBackendParams,
    );

    const params: Record<string, any> = {};
    filters.forEach(e => {
      Object.keys(e).forEach(key => {
        params[key] = e[key];
      });
    });
    return params;
  }, [cellFilters, columnFilters]);

  const cellClickedEvent = (event: CellClickedEvent) => {
    const colClicked: string = event.colDef.field ? event.colDef.field : '';

    if (!filterMode && !disabledEditModeCols.includes(colClicked)) {
      navigate(`/courses/${courseId}/grading/${event.data.actionsIndex}`);
    } else if (filterMode && !disabledFilterModeCols.includes(colClicked)) {
      if (event.data[colClicked] === null || event.data[colClicked] === '') {
        return;
      }
      handleFilterAdd({ id: colClicked, value: event.data[colClicked] });
    }
  };

  // Filter is to filter by cell value
  const handleFilterAdd = ({ id, value }: ColumnFilter) => {
    const alreadyExists = columnFilters.some(curr => curr.id === id && curr.value === value);
    if (!alreadyExists) {
      setColumnFilters([...columnFilters, { id, value }]);
    }
  };

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    setColumnFilters(newFilters);
  };

  useEffect(() => {
    if (
      !showAllSubmissions &&
      columnFilters.reduce(
        (doesItContain, currentFilter) =>
          doesItContain ||
          (currentFilter.id === ColumnFields.progressStatus &&
            String(currentFilter.value).toLowerCase() !== ProgressStatuses.graded &&
            String(currentFilter.value).toLowerCase() !== ProgressStatuses.submitted),
        false,
      )
    ) {
      setColumnFilters(columnFilters.filter(filter => filter.id !== ColumnFields.progressStatus));
      return;
    }
    dispatch(WorkspaceActions.updateSubmissionsTableFilters({ columnFilters }));
  }, [columnFilters, showAllSubmissions, setColumnFilters, dispatch]);

  useEffect(() => {
    updateEntries(page, backendFilterParams);
    setFetchedPage(page);
  }, [updateEntries, page, backendFilterParams]);

  useEffect(() => {
    if (gridRef.current?.api) {
      const newData: IGradingTableRow[] = [];

      const sameData: boolean = submissions.reduce((sameData, currentSubmission, index) => {
        const newRow: IGradingTableRow = {
          assessmentName: currentSubmission.assessmentName,
          assessmentType: currentSubmission.assessmentType,
          studentName: currentSubmission.studentName
            ? currentSubmission.studentName
            : currentSubmission.studentNames
              ? currentSubmission.studentNames.join(', ')
              : '',
          studentUsername: currentSubmission.studentUsername
            ? currentSubmission.studentUsername
            : currentSubmission.studentUsernames
              ? currentSubmission.studentUsernames.join(', ')
              : '',
          groupName: currentSubmission.groupName,
          progressStatus: currentSubmission.progress,
          xp:
            currentSubmission.currentXp +
            ' (+' +
            currentSubmission.xpBonus +
            ') / ' +
            currentSubmission.maxXp,
          actionsIndex: currentSubmission.submissionId,
          courseID: courseId!,
        };
        newData.push(newRow);
        return (
          sameData &&
          newRow.actionsIndex === rowData?.[index]?.actionsIndex &&
          newRow.studentUsername === rowData?.[index]?.studentUsername &&
          newRow.groupName === rowData?.[index]?.groupName &&
          newRow.progressStatus === rowData?.[index]?.progressStatus &&
          newRow.xp === rowData?.[index]?.xp
        );
      }, submissions.length === rowData?.length);

      if (!sameData) {
        setRowData(newData);
      }
      // Overlays are controlled declaratively via the `loading` prop; the no-rows
      // overlay shows automatically when the grid has no data and is not loading.
    }
    // We ignore the dependency on rowData purposely as we setRowData above.
    // If not, it could cause a double execution, which is a bit expensive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCounter, submissions, courseId]);

  const columns = useMemo(() => generateCols(filterMode), [filterMode]);

  useEffect(() => {
    setColDefs(columns);
  }, [columns]);

  return (
    <>
      <HiddenColumnsBar
        {...columnVisibility.chipsProps}
        getBadgeColor={getBadgeColorFromLabel}
        className="mt-2"
        label={<GradingText isSecondaryText>Columns Hidden:</GradingText>}
      />

      <GradingFlex justifyContent="space-between" alignItems="center" className="mt-2">
        <GradingFlex alignItems="center">
          <GradingFlex alignItems="center" className="h-7 w-full">
            <Icon icon={IconNames.FILTER_LIST} />
            <GradingText isSecondaryText className="ml-[7.5px]">
              {columnFilters.length > 0 ? (
                'Filters: '
              ) : filterMode === true ? (
                'No filters applied. Click on any cell to filter by its value.' +
                (columnVisibility.hiddenColumns.length === 0
                  ? " Click on any column header's eye icon to hide it."
                  : '')
              ) : (
                <strong>Disable Grading Mode to enable click to filter</strong>
              )}
            </GradingText>
          </GradingFlex>
          <GradingSubmissionFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </GradingFlex>

        <Button
          variant="minimal"
          className={classNames(
            classes['grading-filter-btn'],
            filterMode && classes['grading-filter-btn-on'],
          )}
          onClick={() => setFilterMode((prev: boolean) => !prev)}
        >
          {filterMode ? 'Filter Mode' : 'Grading Mode'}
        </Button>
      </GradingFlex>

      <div className="mt-4">
        <AgGridReact
          theme={themeSource}
          onGridReady={grid => columnVisibility.onReady(grid.api)}
          onFirstDataRendered={columnVisibility.onFirstDataRendered}
          columnDefs={colDefs}
          onCellClicked={cellClickedEvent}
          ref={gridRef}
          rowData={rowData}
          components={tableProperties.customComponents}
          defaultColDef={tableProperties.defaultColDefs}
          headerHeight={tableProperties.headerHeight}
          loading={isLoading || isPageChangePending}
          overlayLoadingTemplate={tableProperties.overlayLoadingTemplate}
          overlayNoRowsTemplate={tableProperties.overlayNoRowsTemplate}
          pagination={tableProperties.pagination}
          paginationPageSize={tableProperties.pageSize}
          paginationPageSizeSelector={false}
          suppressMenuHide={tableProperties.suppressMenuHide}
          suppressPaginationPanel={tableProperties.suppressPaginationPanel}
          domLayout="autoHeight"
          enableCellTextSelection
          ensureDomOrder
          suppressCellFocus
          onFilterChanged={e => {
            if (!e.afterFloatingFilter) {
              return;
            }
            const filters = e.api.getFilterModel();
            const cellFilters = [];
            for (const [key, { filter: query }] of Object.entries(filters)) {
              switch (key) {
                // Fields that BE supports filtering on
                case ColumnFields.assessmentName:
                case ColumnFields.studentName:
                case ColumnFields.studentUsername:
                case ColumnFields.groupName:
                  cellFilters.push({ id: key, value: query });
                  break;
              }
            }
            debouncedUpdateCellFilters(cellFilters);
          }}
        />
      </div>

      <GradingFlex justifyContent="center" className="grading-table-footer w-full gap-x-1.25">
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.DOUBLE_CHEVRON_LEFT}
          onClick={() => goToPage(0)}
          disabled={pendingPage <= 0}
          {...loadingNavButtonProps}
        />
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.ARROW_LEFT}
          onClick={() => goToPage(pendingPage - 1)}
          disabled={pendingPage <= 0}
          {...loadingNavButtonProps}
        />
        <H6 className="my-auto">
          Page {maxPage + 1 === 0 ? 0 : pendingPage + 1} of {maxPage + 1}
        </H6>
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.ARROW_RIGHT}
          onClick={() => goToPage(pendingPage + 1)}
          disabled={pendingPage >= maxPage}
          {...loadingNavButtonProps}
        />
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.DOUBLE_CHEVRON_RIGHT}
          onClick={() => goToPage(maxPage)}
          disabled={pendingPage >= maxPage}
          {...loadingNavButtonProps}
        />
      </GradingFlex>
    </>
  );
}

export default GradingSubmissionTable;
