import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
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
  TextInput
} from '@tremor/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateSubmissionsTableFilters } from 'src/commons/workspace/WorkspaceActions';
import { GradingOverview } from 'src/features/grading/GradingTypes';
import { convertFilterToBackendParams } from 'src/features/grading/GradingUtils';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, GradingStatusBadge, SubmissionStatusBadge } from './GradingBadges';
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
    cell: info => (
      <Filterable onClick={handleClick} column={info.column} value={info.getValue()}>
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

type GradingSubmissionTableProps = {
  totalRows: number;
  pageSize: number;
  submissions: GradingOverview[];
  // TODO: Abstract pageParams object into a useable type.
  updateEntries: (pageParams: { offset: number; pageSize: number }, filterParams: any) => void;
};

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({
  totalRows,
  pageSize,
  submissions,
  updateEntries
}) => {
  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(tableFilters.globalFilter);

  const [page, setPage] = useState(0);

  // This is needed because a filter change, or a change in pageSize prop, is accompanied with a page reset.
  const resetPage = useCallback(() => setPage(0), [setPage]);

  const maxPage = useMemo(() => Math.ceil(totalRows / pageSize) - 1, [totalRows, pageSize]);

  // Converts the columnFilters array into backend query parameters.
  // Memoized as derived data to prevent infinite re-rendering.
  // TEMP IMPLEMENTATION. Values currently hardcoded with knowledge of what a ColumnFilter is.
  // TODO: remove hardcoding conversion of all submissions to column filter. it is a hacky workaround.
  // TODO: implement reversible backend-frontend name conversion for use in RequestsSaga and here, remove hardcode.
  // TODO: make a controller component, like in the achievements page, to handle conversion of page state into JSON.
  const backendFilterParams = useMemo(() => {
    return columnFilters.map(convertFilterToBackendParams).reduce(Object.assign, {});
  }, [columnFilters]);

  // Adapts frontend page and pageSize state into useable offset for backend usage.
  const pageParams = useMemo(() => {
    return {
      offset: page * pageSize,
      pageSize: pageSize
    };
  }, [page, pageSize]);

  const columns = useMemo(() => makeColumns(resetPage), [resetPage]);

  useEffect(() => resetPage(), [resetPage, pageSize]);

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
    getPaginationRowModel: getPaginationRowModel()
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

  // initialization is done by the main page.
  const isFirstRender = useRef(true);
  // tells page to ask for new entries from main page when its state changes.
  useEffect(() => {
    if (isFirstRender.current === true) {
      isFirstRender.current = false;
    } else {
      updateEntries(pageParams, backendFilterParams);
    }
  }, [updateEntries, pageParams, backendFilterParams]);

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
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 0}
            />
            <Bold>
              Page {page + 1} of {maxPage + 1}
            </Bold>
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.ARROW_RIGHT} />}
              variant="light"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= maxPage}
            />
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.DOUBLE_CHEVRON_RIGHT} />}
              variant="light"
              onClick={() => setPage(maxPage)}
              disabled={page >= maxPage}
            />
          </Flex>
        </Footer>
      </Table>
    </>
  );
};

type FilterableProps = {
  column: Column<any, unknown>;
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
export default GradingSubmissionTable;
