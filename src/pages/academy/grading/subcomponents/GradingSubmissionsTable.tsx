import { Button, H6, Icon, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { CellClickedEvent, ColDef } from 'ag-grid-community';
import { AgGridReact, type CustomHeaderProps } from 'ag-grid-react';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ColumnFiltersState,
  GradingOverview,
  IGradingTableProperties,
  IGradingTableRow,
  SortStateProperties,
} from 'src/features/grading/GradingTypes';
import { ColumnFields, ColumnName, SortStates } from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';

import classes from '../Grading.module.css';
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

function GradingSubmissionTable({
  showAllSubmissions,
  totalRows,
  pageSize,
  submissions,
  updateEntries,
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const tableFilters = useAppSelector(state => state.workspaces.grading.submissionsTableFilters);
  const requestCounter = useAppSelector(state => state.workspaces.grading.requestCounter);
  const courseId = useAppSelector(store => store.session.courseId);

  const gridRef = useRef<AgGridReact<IGradingTableRow>>(null);

  const [page, setPage] = useState(0);
  /** The value to be shown in the search bar */
  const [searchQuery, setSearchQuery] = useState('');
  /** The actual value sent to the backend */
  const [searchValue, setSearchValue] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters,
  ]);
  const [cellFilters, setCellFilters] = useState<{ id: ColumnFields; value: string }[]>([]);
  const columnVisibility = useColumnVisibility({
    getColumnLabel: id => ColumnName[id as ColumnFieldsKeys],
  });
  const [rowData, setRowData] = useState<IGradingTableRow[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<IGradingTableRow>[]>();
  // This is what that controls Grading Mode. If future feedback says it's better to default to filter mode, change it here.
  const [filterMode, setFilterMode] = useState<boolean>(false);

  const isLoading = useMemo(() => requestCounter > 0, [requestCounter]);

  const maxPage = useMemo(() => Math.ceil(totalRows / pageSize) - 1, [totalRows, pageSize]);
  const resetPage = useCallback(() => setPage(0), [setPage]);

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
    suppressRowClickSelection: true,
  };

  // Placing searchValue as a dependency for triggering a page reset will result in double-querying.
  const debouncedUpdateSearchValue = useMemo(
    () =>
      debounce((newValue: string) => {
        resetPage();
        setSearchValue(newValue);
      }, 300),
    [resetPage],
  );

  const handleSearchQueryUpdate: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSearchQuery(e.target.value);
    debouncedUpdateSearchValue(e.target.value);
  };

  const debouncedUpdateCellFilters = useMemo(() => debounce(setCellFilters, 300), []);

  // Converts the columnFilters array into backend query parameters.
  const backendFilterParams = useMemo(() => {
    const filters: Array<{ [key: string]: any }> = [
      { id: ColumnFields.assessmentName, value: searchValue },
      ...columnFilters,
      ...cellFilters,
    ].map(convertFilterToBackendParams);

    const params: Record<string, any> = {};
    filters.forEach(e => {
      Object.keys(e).forEach(key => {
        params[key] = e[key];
      });
    });
    return params;
  }, [cellFilters, columnFilters, searchValue]);

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
    setColumnFilters((prev: ColumnFiltersState) => {
      const alreadyExists = prev.reduce(
        (acc, curr) => acc || (curr.id === id && curr.value === value),
        false,
      );
      return alreadyExists ? [...prev] : [...prev, { id, value }];
    });
    resetPage();
  };

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    setColumnFilters(newFilters);
    resetPage();
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
      setColumnFilters((prev: ColumnFiltersState) =>
        prev.filter(filter => filter.id !== ColumnFields.progressStatus),
      );
      resetPage();
      return;
    }
    dispatch(WorkspaceActions.updateSubmissionsTableFilters({ columnFilters }));
  }, [columnFilters, showAllSubmissions, dispatch, resetPage]);

  useEffect(() => {
    resetPage();
  }, [updateEntries, resetPage]);

  useEffect(() => {
    updateEntries(page, backendFilterParams);
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

      gridRef.current!.api.hideOverlay();

      if (newData.length === 0 && requestCounter <= 0) {
        gridRef.current!.api.showNoRowsOverlay();
      }
    }
    // We ignore the dependency on rowData purposely as we setRowData above.
    // If not, it could cause a double execution, which is a bit expensive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCounter, submissions, courseId]);

  const columns = useMemo(() => generateCols(filterMode), [filterMode]);

  useEffect(() => {
    setColDefs(columns);
  }, [resetPage, columns]);

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
          onClick={e => setFilterMode((prev: boolean) => !prev)}
        >
          {filterMode ? 'Filter Mode' : 'Grading Mode'}
        </Button>

        <InputGroup
          className="grading-search-input"
          placeholder="Search by assessment name"
          leftIcon="search"
          size="large"
          value={searchQuery}
          onChange={handleSearchQueryUpdate}
        />
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
          loading={isLoading}
          overlayLoadingTemplate={tableProperties.overlayLoadingTemplate}
          overlayNoRowsTemplate={tableProperties.overlayNoRowsTemplate}
          pagination={tableProperties.pagination}
          paginationPageSize={tableProperties.pageSize}
          suppressMenuHide={tableProperties.suppressMenuHide}
          suppressPaginationPanel={tableProperties.suppressPaginationPanel}
          rowSelection={{
            mode: 'singleRow',
            enableClickSelection: !tableProperties.suppressRowClickSelection,
          }}
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
          onClick={() => setPage(0)}
          disabled={page <= 0 || isLoading}
        />
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.ARROW_LEFT}
          onClick={() => setPage(page - 1)}
          disabled={page <= 0 || isLoading}
        />
        <H6 className="my-auto">
          Page {maxPage + 1 === 0 ? 0 : page + 1} of {maxPage + 1}
        </H6>
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.ARROW_RIGHT}
          onClick={() => setPage(page + 1)}
          disabled={page >= maxPage || isLoading}
        />
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.DOUBLE_CHEVRON_RIGHT}
          onClick={() => setPage(maxPage)}
          disabled={page >= maxPage || isLoading}
        />
      </GradingFlex>
    </>
  );
}

export default GradingSubmissionTable;
