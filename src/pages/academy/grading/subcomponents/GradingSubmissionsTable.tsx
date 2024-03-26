import '@tremor/react/dist/esm/tremor.css';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css"

import { Button, H6, Icon as BpIcon, InputGroup } from '@blueprintjs/core';
// import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  // Column,
  ColumnFilter,
  ColumnFiltersState,
  // createColumnHelper,
  // flexRender,
  // getCoreRowModel,
  // getFilteredRowModel,
  // getPaginationRowModel,
  // useReactTable
} from '@tanstack/react-table';
// import {
//   Footer,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeaderCell,
//   TableRow,
//   TextInput
// } from '@tremor/react';
import { CellClickedEvent, ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  increaseRequestCounter,
  updateGradingColumnVisibility,
  updateSubmissionsTableFilters
} from 'src/commons/workspace/WorkspaceActions';
import { GradingColumnVisibility } from 'src/commons/workspace/WorkspaceTypes';
import { GradingOverview } from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, GradingStatusBadge, SubmissionStatusBadge } from './GradingBadges';
import GradingColumnCustomHeaders from './GradingColumnCustomHeaders';
import GradingColumnFilters from './GradingColumnFilters';
import GradingSubmissionFilters from './GradingSubmissionFilters';

// const columnHelper = createColumnHelper<GradingOverview>();

// const makeColumns = (handleClick: () => void) => [
//   columnHelper.accessor('assessmentName', {
//     header: 'Name',
//     cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
//   }),
//   columnHelper.accessor('assessmentType', {
//     header: 'Type',
//     cell: info => (
//       <Filterable onClick={handleClick} column={info.column} value={info.getValue()}>
//         <AssessmentTypeBadge type={info.getValue()} />
//       </Filterable>
//     )
//   }),
//   columnHelper.accessor('studentName', {
//     header: 'Student',
//     cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
//   }),
//   columnHelper.accessor('studentUsername', {
//     header: 'Username',
//     cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
//   }),
//   columnHelper.accessor('groupName', {
//     header: 'Group',
//     cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
//   }),
//   columnHelper.accessor('submissionStatus', {
//     header: 'Progress',
//     cell: info => (
//       <Filterable onClick={handleClick} column={info.column} value={info.getValue()}>
//         <SubmissionStatusBadge status={info.getValue()} />
//       </Filterable>
//     )
//   }),
//   columnHelper.accessor('gradingStatus', {
//     header: 'Grading',
//     cell: info => <GradingStatusBadge status={info.getValue()} />
//   }),
//   columnHelper.accessor(({ currentXp, xpBonus, maxXp }) => ({ currentXp, xpBonus, maxXp }), {
//     header: 'Raw XP (+Bonus)',
//     enableColumnFilter: false,
//     cell: info => {
//       const { currentXp, xpBonus, maxXp } = info.getValue();
//       return (
//         <GradingFlex justifyContent="justify-start" style={{ columnGap: "7.5px" }}>
//           <GradingText>
//             {currentXp} (+{xpBonus})
//           </GradingText>
//           <GradingText>/</GradingText>
//           <GradingText>{maxXp}</GradingText>
//         </GradingFlex>
//       );
//     }
//   }),
//   columnHelper.accessor(({ submissionId }) => ({ submissionId }), {
//     header: 'Actions',
//     enableColumnFilter: false,
//     cell: info => {
//       const { submissionId } = info.getValue();
//       return <GradingActions submissionId={submissionId} />;
//     }
//   })
// ];

export enum SortStates {
  ASC = 'sort-asc',
  DESC = 'sort-desc',
  NONE = 'sort'
}

export const getNextSortState = (current: SortStates) => {
  switch (current) {
    case SortStates.NONE:
      return SortStates.ASC;
    case SortStates.ASC:
      return SortStates.DESC;
    case SortStates.DESC:
      return SortStates.NONE;
    default:
      return SortStates.NONE;
  }
}

type GradingSubmissionTableProps = {
  totalRows: number;
  pageSize: number;
  submissions: GradingOverview[];
  updateEntries: (page: number, filterParams: Object) => void;
};

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({
  totalRows,
  pageSize,
  submissions,
  updateEntries,
}) => {

  // End of Original Code

  interface IGradingTableRow {
    assessmentName: string;
    assessmentType: string;
    studentName: string;
    studentUsername: string;
    groupName: string;
    submissionStatus: string;
    gradingStatus: string;
    xp: string;
    actionsIndex: number;
    courseID: number;
  }

  interface IGradingTableProperties {
    defaultColDefs: ColDef;
    pagination: boolean;
    pageSize: number;
    suppressPaginationPanel: boolean;
    rowClass: string;
    rowHeight: number;
    overlayNoRowsTemplate: string;
    overlayLoadingTemplate: string;
    suppressRowClickSelection: boolean;
    tableHeight: string;
    tableMargins: string;
  }

  interface SortStateProperties {
    assessmentName: SortStates;
    assessmentType: SortStates;
    studentName: SortStates;
    studentUsername: SortStates;
    groupName: SortStates;
    submissionStatus: SortStates;
    gradingStatus: SortStates;
    xp: SortStates;
    actionsIndex: SortStates;
  }

  enum ColumnFields {
    assessmentName = "assessmentName",
    assessmentType = "assessmentType",
    studentName = "studentName",
    studentUsername = "studentUsername",
    groupName = "groupName",
    submissionStatus = "submissionStatus",
    gradingStatus = "gradingStatus",
    xp = "xp",
    actionsIndex = "actionsIndex",
  }

  enum ColumnName {
    assessmentName = "Name",
    assessmentType = "Type",
    studentName = "Student",
    studentUsername = "Username",
    groupName = "Group",
    submissionStatus = "Progress",
    gradingStatus = "Grading",
    xp = "Raw XP (+Bonus)",
    actionsIndex = "Actions",
  }

  const freshSortState: SortStateProperties = {
    assessmentName: SortStates.NONE,
    assessmentType: SortStates.NONE,
    studentName: SortStates.NONE,
    studentUsername: SortStates.NONE,
    groupName: SortStates.NONE,
    submissionStatus: SortStates.NONE,
    gradingStatus: SortStates.NONE,
    xp: SortStates.NONE,
    actionsIndex: SortStates.NONE,
  };

  const customComponents = {
    agColumnHeader: GradingColumnCustomHeaders,
  };

  const disabledEditModeCols: string[] = [
    ColumnFields.actionsIndex,
  ]

  const disabledFilterModeCols: string[] = [
    ColumnFields.gradingStatus,
    ColumnFields.xp,
    ColumnFields.actionsIndex,
  ]

  const newSortState = (affectedID: ColumnFields, sortDirection: SortStates) => {
    setColumnSortStates((prev) => {
      const newState: SortStateProperties = {...prev};
      newState[affectedID] = sortDirection;
      return newState;
    });
    setColumnSortOrder((prev) => {
      const newOrder: ColumnFields[] = prev.filter((item) => String(item) !== String(affectedID));
      if (sortDirection !== SortStates.NONE) {
        newOrder.push(affectedID);
      }
      return newOrder;
    })
  }

  const defaultColumnDefs: ColDef = {
    filter: false,
    resizable: false,
    sortable: true,
    headerComponentParams: {
      hideColumn: (id: string) => handleColumnFilterAdd(id),
      newSortState: newSortState,
    },
  };

  const ROW_HEIGHT: number = 60; // in px, declared here to calculate table height

  const tableProperties: IGradingTableProperties = {
    defaultColDefs: defaultColumnDefs,
    pagination: true,
    pageSize: pageSize,
    suppressPaginationPanel: true,
    rowClass: "grading-left-align grading-table-rows",
    rowHeight: ROW_HEIGHT,
    overlayNoRowsTemplate: "Hmm... No submissions found, did you filter them all out?",
    overlayLoadingTemplate: '<div aria-live="polite" aria-atomic="true" style="position:absolute;top:0;left:0;right:0; bottom:0; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center no-repeat" aria-label="loading"></div>',
    suppressRowClickSelection: true,
    tableHeight: String(ROW_HEIGHT * Math.min(pageSize, Math.max(2, submissions.length)) + 48) + "px",
    tableMargins: "1rem 0 0 0",
  };

  const [rowData, setRowData] = useState<IGradingTableRow[]>();
  const [colDefs, setColDefs] = useState<ColDef<IGradingTableRow>[]>();
  const [filterMode, setFilterMode] = useState<boolean>(false);
  const [columnSortStates, setColumnSortStates] = useState<SortStateProperties>(freshSortState);
  const [columnSortOrder, setColumnSortOrder] = useState<ColumnFields[]>([]);

  const gridRef = useRef<AgGridReact<IGradingTableRow>>(null);

  const generateCols = useCallback(() => {

    const cols: ColDef<IGradingTableRow>[] = [];

    const generalColProperties: ColDef<IGradingTableRow> = {
      suppressMovable: true,
      cellClass: "grading-def-cell grading-def-cell-pointer",
      headerClass: "grading-default-headers",
      flex: 1, 
    }

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.assessmentName, 
      field: ColumnFields.assessmentName, 
      flex: 3, 
      cellClass: generalColProperties.cellClass + " grading-cell-align-left",
      headerClass: generalColProperties.headerClass + " grading-left-align",
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.assessmentName,
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.assessmentType, 
      field: ColumnFields.assessmentType, 
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.assessmentType,
                children: [<AssessmentTypeBadge type={params.data.assessmentType} />],
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.studentName, 
      field: ColumnFields.studentName, 
      flex: 1.5, 
      cellClass: generalColProperties.cellClass + " grading-cell-align-left",
      headerClass: generalColProperties.headerClass + " grading-left-align",
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.studentName,
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.studentUsername, 
      field: ColumnFields.studentUsername, 
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.studentUsername,
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.groupName, 
      field: ColumnFields.groupName, 
      flex: 0.75, 
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.groupName,
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.submissionStatus, 
      field: ColumnFields.submissionStatus, 
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                value: params.data.submissionStatus, 
                children: [<SubmissionStatusBadge status={params.data.submissionStatus} />],
                filterMode: filterMode,
              }
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.gradingStatus, 
      field: ColumnFields.gradingStatus, 
      cellClass: generalColProperties.cellClass + (!filterMode ? " grading-def-cell-pointer" : ""),
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: GradingStatusBadge, 
              params: {
                status: params.data.gradingStatus
              } 
            }
          : undefined;
      }, 
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.xp, 
      field: ColumnFields.xp, 
      cellClass: generalColProperties.cellClass + (!filterMode ? " grading-def-cell-pointer" : " grading-def-cell-selectable"),
    });

    cols.push({ 
      ...generalColProperties,
      headerName: ColumnName.actionsIndex, 
      field: ColumnFields.actionsIndex, 
      cellRendererSelector: (params: ICellRendererParams<IGradingTableRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: GradingActions, 
              params: {
                submissionId: params.data.actionsIndex, 
                style: {justifyContent: "center"} 
              } 
            }
          : undefined;
      }, 
    });

    return cols;
  }, [ColumnFields, ColumnName, filterMode]);

  // const showLoading = useCallback(() => {
  //   gridRef.current!.api.showLoadingOverlay();
  // }, [])

  // const hideLoading = useCallback(() => {
  //   gridRef.current!.api.hideOverlay();
  // }, [])

  // const showNoRows = useCallback(() => {
  //   gridRef.current!.api.showNoRowsOverlay();
  // }, [])

  const cellClickedEvent = (event: CellClickedEvent) => {

    const colClicked: string = event.colDef.field ? event.colDef.field : "";

    if (!filterMode && !disabledEditModeCols.includes(colClicked)) {
      navigate(`/courses/${courseId}/grading/${event.data.actionsIndex}`);
    } else if (filterMode && !disabledFilterModeCols.includes(colClicked)) {
      handleFilterAdd({id: colClicked, value: event.data[colClicked]});
    }

  };

  // Start of Original Code
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);
  const columnVisibility = useTypedSelector(state => state.workspaces.grading.columnVisiblity);
  const requestCounter = useTypedSelector(state => state.workspaces.grading.requestCounter);
  const courseId = useTypedSelector(store => store.session.courseId);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);

  const [hiddenColumns, setHiddenColumns] = useState<GradingColumnVisibility>(
    columnVisibility ? columnVisibility : []
  );

  const [page, setPage] = useState(0);
  const maxPage = useMemo(() => Math.ceil(totalRows / pageSize) - 1, [totalRows, pageSize]);
  const resetPage = useCallback(() => setPage(0), [setPage]);

  /** The value to be shown in the search bar */
  const [searchQuery, setSearchQuery] = useState('');
  /** The actual value sent to the backend */
  const [searchValue, setSearchValue] = useState('');
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

  // Converts the columnFilters array into backend query parameters.
  const backendFilterParams = useMemo(() => {
    const filters: Array<{ [key: string]: any }> = [
      { id: ColumnFields.assessmentName, value: searchValue },
      ...columnFilters
    ].map(convertFilterToBackendParams);

    const params: Record<string, any> = {};
    filters.forEach(e => {
      Object.keys(e).forEach(key => {
        params[key] = e[key];
      });
    });
    return params;
  }, [columnFilters, searchValue, ColumnFields.assessmentName]);

  // const columns = useMemo(() => makeColumns(resetPage), [resetPage]);
  // const table = useReactTable({
  //   data: submissions,
  //   columns,
  //   state: {
  //     columnFilters,
  //     pagination: {
  //       pageIndex: 0,
  //       pageSize: pageSize
  //     }
  //   },
  //   onColumnFiltersChange: setColumnFilters,
  //   getCoreRowModel: getCoreRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getPaginationRowModel: getPaginationRowModel()
  // });

  const handleFilterAdd = ({ id, value }: ColumnFilter) => {
    dispatch(increaseRequestCounter());
    setColumnFilters((prev: ColumnFiltersState) => {
      const alreadyExists = prev.reduce((acc, curr) => acc || (curr.id === id && curr.value === value), false);
      return alreadyExists 
        ? [...prev] 
        : [
          ...prev,
          {
            id: id,
            value: value
          }
        ];
    });
    resetPage();
  };
    

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    dispatch(increaseRequestCounter());
    setColumnFilters(newFilters);
    resetPage();
  };

  const handleColumnFilterRemove = (toRemove: string) => {
    if (gridRef.current?.api) {
      setHiddenColumns((prev: GradingColumnVisibility) => prev.filter(column => column !== toRemove));
      gridRef.current.api.setColumnsVisible([toRemove], true);
    }
  };

  const handleColumnFilterAdd = (toAdd: string) => {
    setHiddenColumns((prev: GradingColumnVisibility) => [...prev, toAdd]);
  };

  useEffect(() => {
    dispatch(updateSubmissionsTableFilters({ columnFilters }));
  }, [columnFilters, dispatch]);

  useEffect(() => {
    dispatch(updateGradingColumnVisibility(hiddenColumns));
    if (gridRef.current?.api) {
      gridRef.current.api.setColumnsVisible(hiddenColumns, false);
    }
  }, [hiddenColumns, dispatch]);

  useEffect(() => {
    resetPage();
  }, [updateEntries, resetPage, searchValue]);

  useEffect(() => {
    updateEntries(page, backendFilterParams);
  }, [updateEntries, page, backendFilterParams]);

  useEffect(() => {
    // TODO BACKEND SORT
    console.log(columnSortStates);
    console.log(columnSortOrder);
  }, [columnSortStates, columnSortOrder]);

  // End of Original Code

  useEffect(() => {
    if (gridRef.current?.api) {
      if (requestCounter <= 0) {

        const newData: IGradingTableRow[] = [];

        const sameData: boolean = submissions.reduce(
          (accumulator, currentSubmission, index) => {
            newData.push({
              assessmentName: currentSubmission.assessmentName,
              assessmentType: currentSubmission.assessmentType,
              studentName: currentSubmission.studentName,
              studentUsername: currentSubmission.studentUsername,
              groupName: currentSubmission.groupName,
              submissionStatus: currentSubmission.submissionStatus,
              gradingStatus: currentSubmission.gradingStatus,
              xp: currentSubmission.currentXp + " (+" + currentSubmission.xpBonus + ") / " + currentSubmission.maxXp,
              actionsIndex: currentSubmission.submissionId,
              courseID: courseId!,
            })
            return accumulator && (currentSubmission.submissionId === rowData?.[index]?.actionsIndex);
          },
          submissions.length === rowData?.length
        );

        if (!sameData) {
          setRowData(newData); 
        }

        gridRef.current!.api.hideOverlay();
        
      } else {
        gridRef.current!.api.showLoadingOverlay();
      }
    }
    // We ignore the dependency on rowData purposely as we setRowData above. If not, it may cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestCounter, submissions, courseId]);

  useEffect(() => {
    if (rowData?.length === 0 && requestCounter <= 0 && gridRef.current?.api) {
      gridRef.current!.api.showNoRowsOverlay();
    }
  }, [requestCounter, rowData]);

  useEffect(() => {
    setColDefs(generateCols());
  }, [resetPage, filterMode, generateCols]);

  // Start of Original Code

  return (
    <>
      {hiddenColumns.length > 0 ? (
        <GradingFlex justifyContent="justify-between" alignItems="items-center" style={{ marginTop: "0.5rem" }}>
          <GradingFlex>
            <GradingText secondaryText>Columns Hidden:</GradingText>
            <GradingColumnFilters
              filters={hiddenColumns}
              filtersName={hiddenColumns.map(id => {
                for (const item in ColumnName) {
                  if (ColumnFields[item] === id) {
                    return ColumnName[item];
                  }
                }
                return '';
              })}
              onFilterRemove={handleColumnFilterRemove}
            />
          </GradingFlex>
        </GradingFlex>
      ) : (
        <></>
      )}
      
      <GradingFlex justifyContent="justify-between" alignItems="items-center" style={{ marginTop: "0.5rem" }}>
        <GradingFlex alignItems="items-center">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '1.75rem', width: "100%" }}>
            <BpIcon icon={IconNames.FILTER_LIST} />
            <GradingText secondaryText>
              {columnFilters.length > 0
                ? 'Filters: '
                : (filterMode === true
                  ? 'No filters applied. Click on any cell to filter by its value.' +
                    (hiddenColumns.length === 0
                      ? ' Click on any column header to hide it.'
                      : '')
                  : <strong>Disable Grading Mode to enable click to filter</strong>)}{' '}
            </GradingText>
          </div>
          <GradingSubmissionFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </GradingFlex>

        <button className={(filterMode ? "grading-filter-btn-on " : "") + "grading-filter-btn"} onClick={(e) => setFilterMode((prev: boolean) => !prev)}>
          {filterMode ? "Filter Mode" : "Grading Mode"}
        </button>

        {/* <TextInput
          maxWidth="max-w-sm"
          icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
          placeholder="Search by assessment name"
          value={searchQuery}
          onChange={handleSearchQueryUpdate}
        /> */}
        <InputGroup
          className="grading-search-input"
          placeholder="Search by assessment name"
          leftIcon="search"
          large={true}
          value={searchQuery}
          onChange={handleSearchQueryUpdate}
        ></InputGroup>
      </GradingFlex>
      
      {/* End of Original Code */}

      <div className="ag-theme-quartz" style={{ 
        height: tableProperties.tableHeight, 
        margin: tableProperties.tableMargins 
      }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={tableProperties.defaultColDefs}
          pagination={tableProperties.pagination}
          paginationPageSize={tableProperties.pageSize}
          suppressPaginationPanel={tableProperties.suppressPaginationPanel}
          rowClass={tableProperties.rowClass}
          rowHeight={tableProperties.rowHeight}
          overlayNoRowsTemplate={tableProperties.overlayNoRowsTemplate}
          overlayLoadingTemplate={tableProperties.overlayLoadingTemplate}
          suppressRowClickSelection={tableProperties.suppressRowClickSelection}
          onCellClicked={cellClickedEvent}
          components={customComponents}
          suppressMenuHide={true}
        />
      </div>

      {/* Start of Original Code */}

      {/* <Table marginTop="mt-2">
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header =>
                hiddenColumns.reduce(
                  (accumulator, currentValue) => accumulator || header.id.includes(currentValue),
                  false
                ) ? (
                  <></>
                ) : (
                  <TableHeaderCell key={header.id}>
                    <button
                      type="button"
                      className="grading-overview-filterable-btns tr-text-gray-500 tr-font-semibold"
                      onClick={(e) => {
                        handleColumnFilterAdd(header.getContext().header.id);
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </button>
                  </TableHeaderCell>
                )
              )}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row
                .getVisibleCells()
                .map(cell =>
                  hiddenColumns.reduce(
                    (accumulator, currentValue) => accumulator || cell.id.includes(currentValue),
                    false
                  ) ? (
                    <></>
                  ) : (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                )}
            </TableRow>
          ))}
        </TableBody> */}
        {/* <div className="grading-overview-footer-sibling"></div> */}
        {/* <Footer> */}
        <GradingFlex justifyContent="justify-center" className="grading-table-footer" style={{ width: "100%", columnGap: "5px" }}>
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
          <H6 style={{ margin: "auto 0" }}>
            Page {page + 1} of {maxPage + 1}
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
        {/* </Footer> */}
      {/* </Table> */}
      <GradingFlex style={{ marginTop: "-1.5rem" }} />
    </>
  );
};

// type FilterableProps = {
//   column: Column<any, unknown>;
//   value: string;
//   children?: React.ReactNode;
//   onClick?: () => void;
// };

type FilterablePropsNew = {
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  id: string;
  value: string;
  children?: React.ReactNode;
  onClick?: () => void;
  filterMode: boolean;
};

// const Filterable: React.FC<FilterableProps> = ({ column, value, children, onClick }) => {
//   const handleFilterChange = () => {
//     column.setFilterValue(value);
//     onClick?.();
//   };

//   return (
//     <button type="button" className="grading-overview-filterable-btns" onClick={handleFilterChange}>
//       {children || value}
//     </button>
//   );
// };

const FilterableNew: React.FC<FilterablePropsNew> = ({ value, children, filterMode }) => {
  return (
    <button type="button" className={filterMode ? "grading-overview-filterable-btns" : "grading-overview-unfilterable-btns"}>
      {children || value}
    </button>
  );
};

export default GradingSubmissionTable;
