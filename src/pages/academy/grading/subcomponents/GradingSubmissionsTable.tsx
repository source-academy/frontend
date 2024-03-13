import '@tremor/react/dist/esm/tremor.css';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css"

import { Button, H6, Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  Column,
  ColumnFilter,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  Footer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput
} from '@tremor/react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  updateGradingColumnVisibility,
  updateSubmissionsTableFilters
} from 'src/commons/workspace/WorkspaceActions';
import { GradingColumnVisibility } from 'src/commons/workspace/WorkspaceTypes';
import { GradingOverview } from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, GradingStatusBadge, SubmissionStatusBadge } from './GradingBadges';
import GradingColumnFilters from './GradingColumnFilters';
import GradingSubmissionFilters from './GradingSubmissionFilters';

const columnHelper = createColumnHelper<GradingOverview>();

const makeColumns = (handleClick: () => void) => [
  columnHelper.accessor('assessmentName', {
    header: 'Name',
    cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('assessmentType', {
    header: 'Type',
    cell: info => (
      <Filterable onClick={handleClick} column={info.column} value={info.getValue()}>
        <AssessmentTypeBadge type={info.getValue()} />
      </Filterable>
    )
  }),
  columnHelper.accessor('studentName', {
    header: 'Student',
    cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('studentUsername', {
    header: 'Username',
    cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('groupName', {
    header: 'Group',
    cell: info => <Filterable onClick={handleClick} column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('submissionStatus', {
    header: 'Progress',
    cell: info => (
      <Filterable onClick={handleClick} column={info.column} value={info.getValue()}>
        <SubmissionStatusBadge status={info.getValue()} />
      </Filterable>
    )
  }),
  columnHelper.accessor('gradingStatus', {
    header: 'Grading',
    cell: info => <GradingStatusBadge status={info.getValue()} />
  }),
  columnHelper.accessor(({ currentXp, xpBonus, maxXp }) => ({ currentXp, xpBonus, maxXp }), {
    header: 'Raw XP (+Bonus)',
    enableColumnFilter: false,
    cell: info => {
      const { currentXp, xpBonus, maxXp } = info.getValue();
      return (
        <GradingFlex justifyContent="justify-start" style={{ columnGap: "7.5px" }}>
          <GradingText>
            {currentXp} (+{xpBonus})
          </GradingText>
          <GradingText>/</GradingText>
          <GradingText>{maxXp}</GradingText>
        </GradingFlex>
      );
    }
  }),
  columnHelper.accessor(({ submissionId }) => ({ submissionId }), {
    header: 'Actions',
    enableColumnFilter: false,
    cell: info => {
      const { submissionId } = info.getValue();
      return <GradingActions submissionId={submissionId} />;
    }
  })
];

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
  updateEntries
}) => {

  // End of Original Code

  interface IRow {
    assessmentName: string;
    assessmentType: string;
    studentName: string;
    studentUsername: string;
    groupName: string;
    submissionStatus: string;
    gradingStatus: string;
    xp: string;
    actions: string;
    index: number;
  }

  const defaultColumnDefs: ColDef = {
    filter: false,
    resizable: false,
    sortable: true
  };

  const [rowData, setRowData] = useState<IRow[]>();

  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>();

  const generateCols = (resetPage: () => void) => {
    const cols: ColDef<IRow>[] = [];

    cols.push({ headerName: "Name", field: "assessmentName", flex: 3, cellStyle: defaultCellStyle({textAlign: "left"}), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "assessmentName",
                value: params.data.assessmentName,
                onClick: resetPage,
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses("grading-left-align") });
    cols.push({ headerName: "Type", field: "assessmentType", flex: 1, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "assessmentType",
                value: params.data.assessmentType,
                onClick: resetPage, 
                children: [<AssessmentTypeBadge type={params.data.assessmentType} />]
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Student", field: "studentName", flex: 1.5, cellStyle: defaultCellStyle({textAlign: "left"}), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "studentName",
                value: params.data.studentName,
                onClick: resetPage,
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses("grading-left-align") });
      cols.push({ headerName: "Username", field: "studentUsername", flex: 1, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "studentUsername",
                value: params.data.studentUsername,
                onClick: resetPage,
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Group", field: "groupName", flex: 0.75, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "groupName",
                value: params.data.groupName,
                onClick: resetPage,
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Progress", field: "submissionStatus", flex: 1, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: FilterableNew, 
              params: {
                setColumnFilters: setColumnFilters,
                id: "submissionStatus",
                value: params.data.submissionStatus,
                onClick: resetPage, 
                children: [<SubmissionStatusBadge status={params.data.submissionStatus} />]
              }
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Grading", field: "gradingStatus", flex: 1, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: GradingStatusBadge, 
              params: {
                status: params.data.gradingStatus
              } 
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Raw XP (+Bonus)", field: "xp", flex: 1, cellStyle: defaultCellStyle(), headerClass: defaultHeaderClasses() });
      cols.push({ headerName: "Actions", field: "actions", flex: 1, cellStyle: defaultCellStyle(), cellRendererSelector: (params: ICellRendererParams<IRow>) => {
        return (params.data !== undefined) 
          ? { 
              component: GradingActions, 
              params: {
                submissionId: params.data.index, 
                style: {justifyContent: "center"} 
              } 
            }
          : undefined;
      }, headerClass: defaultHeaderClasses() });

    return cols;
  }

  const defaultCellStyle = (style?: React.CSSProperties) => {
    return {
      textAlign: "center",
      display: "flex", 
      justifyContent: "center", 
      flexDirection: "column",
      fontSize: "0.875rem",
      ...style,
    }
  };

  const defaultHeaderClasses = (extraClass?: string) => {
    return ("grading-default-headers " + (extraClass !== undefined ? extraClass : ""));
  };

  // Start of Original Code
  const dispatch = useDispatch();
  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);
  const columnVisibility = useTypedSelector(state => state.workspaces.grading.columnVisiblity);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);

  const [hiddenColumns, setHiddenColumns] = useState<GradingColumnVisibility>(
    columnVisibility ? columnVisibility : { columns: [] }
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
      { id: 'assessmentName', value: searchValue },
      ...columnFilters
    ].map(convertFilterToBackendParams);

    const params: Record<string, any> = {};
    filters.forEach(e => {
      Object.keys(e).forEach(key => {
        params[key] = e[key];
      });
    });
    return params;
  }, [columnFilters, searchValue]);

  const columns = useMemo(() => makeColumns(resetPage), [resetPage]);
  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: pageSize
      }
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    setColumnFilters(newFilters);
    resetPage();
  };

  const handleColumnFilterRemove = (toRemove: string) => {
    setHiddenColumns((prev: GradingColumnVisibility) => {
      return {
        columns: prev.columns.filter(column => column !== toRemove)
      };
    });
  };

  const handleColumnFilterAdd = (toAdd: string) => {
    setHiddenColumns((prev: GradingColumnVisibility) => {
      return {
        columns: [...prev.columns, toAdd]
      };
    });
  };

  useEffect(() => {
    dispatch(updateSubmissionsTableFilters({ columnFilters }));
  }, [columnFilters, dispatch]);

  useEffect(() => {
    dispatch(updateGradingColumnVisibility(hiddenColumns));
  }, [hiddenColumns, dispatch]);

  useEffect(() => {
    resetPage();
  }, [updateEntries, resetPage, searchValue]);

  useEffect(() => {
    updateEntries(page, backendFilterParams);
  }, [updateEntries, page, backendFilterParams]);

  // End of Original Code

  useEffect(() => {
    setRowData(submissions.map((submission): IRow => {
      return {
        assessmentName: submission.assessmentName,
        assessmentType: submission.assessmentType,
        studentName: submission.studentName,
        studentUsername: submission.studentUsername,
        groupName: submission.groupName,
        submissionStatus: submission.submissionStatus,
        gradingStatus: submission.gradingStatus,
        xp: submission.initialXp + " (+" + submission.xpBonus + ") / " + submission.maxXp,
        actions: "",
        index: submission.submissionId,
      };
    })); 
  }, [submissions]);
  
  useEffect(() => {
    setColDefs(generateCols(resetPage));
  }, [resetPage]);

  // Start of Original Code

  return (
    <>
      {hiddenColumns.columns.length > 0 ? (
        <GradingFlex justifyContent="justify-between" alignItems="items-center" style={{ marginTop: "0.5rem" }}>
          <GradingFlex>
            <GradingText secondaryText>Columns Hidden:</GradingText>
            <GradingColumnFilters
              filters={hiddenColumns.columns}
              filtersName={hiddenColumns.columns.map(id => {
                const headerTexts = columns.filter(
                  col => col['accessorKey'] === id || col['header'] === id
                );
                return headerTexts[0]['header'] ? headerTexts[0]['header'].toString() : '';
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
                : 'No filters applied. Click on any cell to filter by its value.' +
                  (hiddenColumns.columns.length === 0
                    ? ' Click on any column header to hide it.'
                    : '')}{' '}
            </GradingText>
          </div>
          <GradingSubmissionFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </GradingFlex>

        <TextInput
          maxWidth="max-w-sm"
          icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
          placeholder="Search by assessment name"
          value={searchQuery}
          onChange={handleSearchQueryUpdate}
        />
      </GradingFlex>
      
      {/* End of Original Code */}

      <div className="ag-theme-quartz" style={{ height: "50vh" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColumnDefs}
          pagination={true}
          paginationPageSize={pageSize}
          suppressPaginationPanel={true}
          rowClass="grading-left-align"
          rowHeight={60}
        />
      </div>

      {/* Start of Original Code */}

      <Table marginTop="mt-2">
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header =>
                hiddenColumns.columns.reduce(
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
                  hiddenColumns.columns.reduce(
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
        </TableBody>
        <div className="grading-overview-footer-sibling"></div>
        <Footer>
          <GradingFlex justifyContent="justify-center" style={{ width: "100%", columnGap: "5px" }}>
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
        </Footer>
      </Table>
      <GradingFlex style={{ marginTop: "-1.5rem" }} />
    </>
  );
};

type FilterableProps = {
  column: Column<any, unknown>;
  value: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

type FilterablePropsNew = {
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  id: string;
  value: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

const Filterable: React.FC<FilterableProps> = ({ column, value, children, onClick }) => {
  const handleFilterChange = () => {
    column.setFilterValue(value);
    onClick?.();
  };

  return (
    <button type="button" className="grading-overview-filterable-btns" onClick={handleFilterChange}>
      {children || value}
    </button>
  );
};

const FilterableNew: React.FC<FilterablePropsNew> = ({ setColumnFilters, id, value, children, onClick }) => {
  const handleFilterChange = () => {
    setColumnFilters((prev: ColumnFiltersState) => {
      return [
        ...prev,
        {
          id: id,
          value: value
        }
      ];
    });
    onClick?.();
  };

  return (
    <button type="button" className="grading-overview-filterable-btns" onClick={handleFilterChange}>
      {children || value}
    </button>
  );
};

export default GradingSubmissionTable;
