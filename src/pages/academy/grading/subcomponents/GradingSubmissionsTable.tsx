import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { Button, H6, Icon, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { CellClickedEvent, ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import classNames from 'classnames';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ProgressStatuses } from 'src/commons/assessment/AssessmentTypes';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import {
  ColumnFields,
  ColumnFieldsKeys,
  ColumnFilter,
  ColumnFiltersState,
  ColumnName,
  ColumnNameKeys,
  GradingColumnVisibility,
  GradingSubmissionTableProps,
  IGradingTableProperties,
  IGradingTableRow,
  SortStateProperties,
  SortStates
} from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';
import classes from 'src/styles/Grading.module.scss';

import GradingColumnCustomHeaders from './GradingColumnCustomHeaders';
import GradingColumnFilters from './GradingColumnFilters';
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
  actionsIndex: SortStates.NONE
};

const disabledEditModeCols: string[] = [ColumnFields.actionsIndex];

const disabledFilterModeCols: string[] = [ColumnFields.xp, ColumnFields.actionsIndex];

const disabledSortCols: string[] = [ColumnFields.actionsIndex];

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({
  showAllSubmissions,
  totalRows,
  pageSize,
  submissions,
  updateEntries
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);
  const columnVisibility = useTypedSelector(state => state.workspaces.grading.columnVisiblity);
  const requestCounter = useTypedSelector(state => state.workspaces.grading.requestCounter);
  const courseId = useTypedSelector(store => store.session.courseId);

  const gridRef = useRef<AgGridReact<IGradingTableRow>>(null);

  const [page, setPage] = useState(0);
  /** The value to be shown in the search bar */
  const [searchQuery, setSearchQuery] = useState('');
  /** The actual value sent to the backend */
  const [searchValue, setSearchValue] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);
  const [cellFilters, setCellFilters] = useState<{ id: ColumnFields; value: string }[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<GradingColumnVisibility>(
    columnVisibility ? columnVisibility : []
  );
  const [rowData, setRowData] = useState<IGradingTableRow[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<IGradingTableRow>[]>();
  // This is what that controls Grading Mode. If future feedback says it's better to default to filter mode, change it here.
  const [filterMode, setFilterMode] = useState<boolean>(false);

  const maxPage = useMemo(() => Math.ceil(totalRows / pageSize) - 1, [totalRows, pageSize]);
  const resetPage = useCallback(() => setPage(0), [setPage]);

  const defaultColumnDefs: ColDef = {
    filter: false,
    floatingFilter: true,
    resizable: true,
    sortable: true,
    headerComponentParams: {
      hideColumn: (id: ColumnNameKeys) => handleColumnFilterAdd(id),
      updateSortState: (affectedID: ColumnNameKeys, sortDirection: SortStates) => {
        if (!disabledSortCols.includes(affectedID)) {
          const newState: SortStateProperties = { ...freshSortState };
          newState[affectedID] = sortDirection;
          dispatch(
            WorkspaceActions.updateAllColsSortStates({
              currentState: newState,
              sortBy: affectedID
            })
          );
        }
      },
      disabledSortCols: disabledSortCols
    }
  };

  const ROW_HEIGHT: number = 60; // in px, declared here to calculate table height
  const HEADER_HEIGHT: number = 48; // in px, declared here to calculate table height

  const tableProperties: IGradingTableProperties = {
    customComponents: {
      agColumnHeader: GradingColumnCustomHeaders
    },
    defaultColDefs: defaultColumnDefs,
    headerHeight: HEADER_HEIGHT,
    overlayLoadingTemplate: '<div class="grading-loading-icon"></div>',
    overlayNoRowsTemplate:
      "Hmm... we didn't find any submissions, you might want to debug your filter() function.",
    pageSize: pageSize,
    pagination: true,
    rowClass: classNames(classes['grading-left-align'], classes['grading-table-rows']),
    rowHeight: ROW_HEIGHT,
    suppressMenuHide: true,
    suppressPaginationPanel: true,
    suppressRowClickSelection: true,
    tableMargins: '1rem 0 0 0'
  };

  // Placing searchValue as a dependency for triggering a page reset will result in double-querying.
  const debouncedUpdateSearchValue = useMemo(
    () =>
      debounce((newValue: string) => {
        resetPage();
        setSearchValue(newValue);
      }, 300),
    [resetPage]
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
      ...cellFilters
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
        false
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

  // Column Filter is to hide Columns
  const handleColumnFilterRemove = (toRemove: string) => {
    if (gridRef.current?.api) {
      setHiddenColumns((prev: GradingColumnVisibility) =>
        prev.filter(column => column !== toRemove)
      );
      gridRef.current.api.setColumnsVisible([toRemove], true);
    }
  };

  const handleColumnFilterAdd = (toAdd: ColumnNameKeys) => {
    setHiddenColumns((prev: GradingColumnVisibility) => [...prev, toAdd]);
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
        false
      )
    ) {
      setColumnFilters((prev: ColumnFiltersState) =>
        prev.filter(filter => filter.id !== ColumnFields.progressStatus)
      );
      resetPage();
      return;
    }
    dispatch(WorkspaceActions.updateSubmissionsTableFilters({ columnFilters }));
  }, [columnFilters, showAllSubmissions, dispatch, resetPage]);

  useEffect(() => {
    dispatch(WorkspaceActions.updateGradingColumnVisibility(hiddenColumns));
    if (gridRef.current?.api) {
      gridRef.current.api.setColumnsVisible(hiddenColumns, false);
    }
  }, [hiddenColumns, dispatch]);

  useEffect(() => {
    resetPage();
  }, [updateEntries, resetPage]);

  useEffect(() => {
    updateEntries(page, backendFilterParams);
  }, [updateEntries, page, backendFilterParams]);

  useEffect(() => {
    if (gridRef.current?.api) {
      if (requestCounter <= 0) {
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
            courseID: courseId!
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
      } else {
        gridRef.current!.api.showLoadingOverlay();
      }
    }
    // We ignore the dependency on rowData purposely as we setRowData above.
    // If not, it could cause a double execution, which is a bit expensive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCounter, submissions, courseId, gridRef.current?.api]);

  const columns = useMemo(() => generateCols(filterMode), [filterMode]);

  useEffect(() => {
    setColDefs(columns);
  }, [resetPage, columns]);

  return (
    <>
      {hiddenColumns.length > 0 ? (
        <GradingFlex
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: '0.5rem' }}
        >
          <GradingFlex>
            <GradingText isSecondaryText>Columns Hidden:</GradingText>
            <GradingColumnFilters
              filters={hiddenColumns}
              filtersName={hiddenColumns.map((id: ColumnFieldsKeys) => {
                return ColumnName[id];
              })}
              onFilterRemove={handleColumnFilterRemove}
            />
          </GradingFlex>
        </GradingFlex>
      ) : (
        <></>
      )}

      <GradingFlex
        justifyContent="space-between"
        alignItems="center"
        style={{ marginTop: '0.5rem' }}
      >
        <GradingFlex alignItems="center">
          <GradingFlex style={{ alignItems: 'center', height: '1.75rem', width: '100%' }}>
            <Icon icon={IconNames.FILTER_LIST} />
            <GradingText isSecondaryText style={{ marginLeft: '7.5px' }}>
              {columnFilters.length > 0 ? (
                'Filters: '
              ) : filterMode === true ? (
                'No filters applied. Click on any cell to filter by its value.' +
                (hiddenColumns.length === 0
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
          minimal={true}
          className={classNames(
            classes['grading-filter-btn'],
            filterMode && classes['grading-filter-btn-on']
          )}
          onClick={e => setFilterMode((prev: boolean) => !prev)}
        >
          {filterMode ? 'Filter Mode' : 'Grading Mode'}
        </Button>

        <InputGroup
          className="grading-search-input"
          placeholder="Search by assessment name"
          leftIcon="search"
          large={true}
          value={searchQuery}
          onChange={handleSearchQueryUpdate}
        ></InputGroup>
      </GradingFlex>

      <div className="ag-theme-quartz" style={{ margin: tableProperties.tableMargins }}>
        <AgGridReact
          columnDefs={colDefs}
          onCellClicked={cellClickedEvent}
          ref={gridRef}
          rowData={rowData}
          components={tableProperties.customComponents}
          defaultColDef={tableProperties.defaultColDefs}
          headerHeight={tableProperties.headerHeight}
          overlayLoadingTemplate={tableProperties.overlayLoadingTemplate}
          overlayNoRowsTemplate={tableProperties.overlayNoRowsTemplate}
          pagination={tableProperties.pagination}
          paginationPageSize={tableProperties.pageSize}
          rowClass={tableProperties.rowClass}
          rowHeight={tableProperties.rowHeight}
          suppressMenuHide={tableProperties.suppressMenuHide}
          suppressPaginationPanel={tableProperties.suppressPaginationPanel}
          suppressRowClickSelection={tableProperties.suppressRowClickSelection}
          domLayout="autoHeight"
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

      <GradingFlex
        justifyContent="center"
        className="grading-table-footer"
        style={{ width: '100%', columnGap: '5px' }}
      >
        <Button
          small
          minimal
          icon={IconNames.DOUBLE_CHEVRON_LEFT}
          onClick={() => setPage(0)}
          disabled={page <= 0}
        />
        <Button
          small
          minimal
          icon={IconNames.ARROW_LEFT}
          onClick={() => setPage(page - 1)}
          disabled={page <= 0}
        />
        <H6 style={{ margin: 'auto 0' }}>
          Page {maxPage + 1 === 0 ? 0 : page + 1} of {maxPage + 1}
        </H6>
        <Button
          small
          minimal
          icon={IconNames.ARROW_RIGHT}
          onClick={() => setPage(page + 1)}
          disabled={page >= maxPage}
        />
        <Button
          small
          minimal
          icon={IconNames.DOUBLE_CHEVRON_RIGHT}
          onClick={() => setPage(maxPage)}
          disabled={page >= maxPage}
        />
      </GradingFlex>
    </>
  );
};

export default GradingSubmissionTable;
