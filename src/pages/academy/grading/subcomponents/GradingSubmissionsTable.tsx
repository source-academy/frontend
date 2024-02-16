import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon, Position } from '@blueprintjs/core';
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
  useReactTable,
} from '@tanstack/react-table';
import {
  Bold,
  Button,
  Flex,
  Footer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
} from '@tremor/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateSubmissionsTableFilters } from 'src/commons/workspace/WorkspaceActions';
import { GradingOverview } from 'src/features/grading/GradingTypes';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, GradingStatusBadge, SubmissionStatusBadge } from './GradingBadges';
import GradingSubmissionFilters from './GradingSubmissionFilters';
import { FilterStatus } from 'src/features/achievement/AchievementTypes';
import SimpleDropdown from 'src/commons/SimpleDropdown';


type GradingSubmissionTableProps = {
  totalRows: number;
  submissions: GradingOverview[];
  // TEMPORARY IMPLEMENTATION. TODO: Refactor into a unified type once proof of feature is complete.
  updateEntries: (group: boolean, pageParams: any, filterParams: any) => void;
};

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({ totalRows, submissions, updateEntries }) => {
  const columnHelper = createColumnHelper<GradingOverview>();

  const columns = [
    columnHelper.accessor('assessmentName', {
      header: 'Name',
      cell: info => <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}/>
    }),
    columnHelper.accessor('assessmentType', {
      header: 'Type',
      cell: info => (
        <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}>
          <AssessmentTypeBadge type={info.getValue()} />
        </Filterable>
      )
    }),
    columnHelper.accessor('studentName', {
      header: 'Student',
      cell: info => <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)} />
    }),
    columnHelper.accessor('studentUsername', {
      header: 'Username',
      cell: info => <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}/>
    }),
    columnHelper.accessor('groupName', {
      header: 'Group',
      cell: info => <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}/>
    }),
    columnHelper.accessor('submissionStatus', {
      header: 'Progress',
      cell: info => (
        <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}>
          <SubmissionStatusBadge status={info.getValue()} />
        </Filterable>
      )
    }),
    columnHelper.accessor('gradingStatus', {
      header: 'Grading',
      cell: info => (
        <Filterable column={info.column} value={info.getValue()} resetpage={() => setPage(0)}>
          <GradingStatusBadge status={info.getValue()} />
        </Filterable>
      )
    }),
    columnHelper.accessor(({ currentXp, xpBonus, maxXp }) => ({ currentXp, xpBonus, maxXp }), {
      header: 'Raw XP (+Bonus)',
      enableColumnFilter: false,
      cell: info => {
        const { currentXp, xpBonus, maxXp } = info.getValue();
        return (
          <Flex justifyContent="justify-start" spaceX="space-x-2">
            <Text>
              {currentXp} (+{xpBonus})
            </Text>
            <Text>/</Text>
            <Text>{maxXp}</Text>
          </Flex>
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

  type FilterableProps = {
    column: Column<any, unknown>;
    value: string;
    children?: React.ReactNode;
    resetpage: () => void;
  };
  
  const Filterable: React.FC<FilterableProps> = ({ column, value, children, resetpage }) => {
    const handleFilterChange = () => {
      column.setFilterValue(value);
      resetpage();
    };
  
    return (
      <button type="button" onClick={handleFilterChange} style={{ padding: 0 }}>
        {children || value}
      </button>
    );
  };


  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(tableFilters.globalFilter);

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination: {
        // pagination is handled by server to fit exactly the pageSize. Thus, hardcode frontend pageIndex to 0.
        pageIndex: 0,
        pageSize: pageSize
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    setColumnFilters(newFilters);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      updateSubmissionsTableFilters({
        columnFilters,
        globalFilter
      })
    );
  }, [columnFilters, globalFilter, dispatch]);

  // Adapts frontend page and pageSize state into useable offset for backend usage.
  const pageParams = (): any => {
    return {
      offset: page * pageSize,
      pageSize: pageSize,
    }
  }

  // Converts the columnFilters array into backend query parameters.
  // TEMP IMPLEMENTATION. Values currently hardcoded.
  // TODO: implement reversible backend-frontend name conversion for use in RequestsSaga and here.
  const backendFilterParams = (columnFilters: ColumnFilter[]): any => {
    // translates filter columns to backend query name
    const backendNameOf = (val: string): string => {
      switch (val) {
        case "assessmentName": return "title";
        case "assessmentType": return "type";
        case "studentName": return "name";
        case "studentUsername": return "username";
        case "submissionStatus": return "status";
        default:
          return val;
      }
    }

  
    // This restricts each column to have only 1 accepted filter. Could be improved?
    const queryParams = {}
    console.log(columnFilters.entries());
    columnFilters.map(column => {queryParams[backendNameOf(column.id)] = column.value;});
    return queryParams;
  }

  // handles re-rendering of component after update of filters or parameters.
  useEffect(() => {
    updateEntries(false, pageParams(), backendFilterParams(columnFilters));
  }, [columnFilters, page, pageSize])
  

  // dropdown to select pageSize
  const pageSizeOptions = [
    { value: 1, label: '1' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];
  

  return (
    <>
      <Flex marginTop="mt-2" justifyContent="justify-between" alignItems="items-center">
        <Flex alignItems="items-center" spaceX="space-x-2">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '1.75rem' }}>
            <BpIcon icon={IconNames.FILTER_LIST} />
            <Text>
              {columnFilters.length > 0
                ? 'Filters: '
                : 'No filters applied. Click on any cell to filter by its value.'}{' '}
            </Text>
          </div>
          <GradingSubmissionFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </Flex>

        <TextInput
          maxWidth="max-w-sm"
          icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
          placeholder="Search for any value here..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
        />
      </Flex>
      <Table marginTop="mt-2">
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>

        <Footer>
          <Flex justifyContent="justify-center" spaceX="space-x-3">
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.DOUBLE_CHEVRON_LEFT} />}
              variant="light"
              onClick={() => setPage(0)}
              disabled={page <= 0}
            />
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.ARROW_LEFT} />}
              variant="light"
              onClick={() => setPage(page - 1)}
              disabled={page <= 0}
            />
            <Bold>
              Page {page + 1} of {Math.ceil(totalRows / pageSize)}
            </Bold>
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.ARROW_RIGHT} />}
              variant="light"
              onClick={() => setPage(page + 1)}
              disabled={page >= (Math.ceil(totalRows / pageSize) - 1)}
            />
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.DOUBLE_CHEVRON_RIGHT} />}
              variant="light"
              onClick={() => setPage(Math.ceil(totalRows / pageSize) - 1)}
              disabled={page >= (Math.ceil(totalRows / pageSize) - 1)}
            />
            <SimpleDropdown
              options={pageSizeOptions}
              selectedValue={pageSize}
              onClick={setPageSize}
              popoverProps={{ position: Position.BOTTOM }}
              //buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
            />
          </Flex>
        </Footer>
      </Table>
    </>
  );
};

export default GradingSubmissionTable;
