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
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text
} from '@tremor/react';
import { useState } from 'react';
import { GradingOverview } from 'src/features/grading/GradingTypes';

import {
  AssessmentTypeBadge,
  GradingStatusBadge,
  SubmissionStatusBadge
} from './GradingStatusBadges';
import GradingSubmissionFilters from './GradingSubmissionFilters';

const columnHelper = createColumnHelper<GradingOverview>();

const columns = [
  columnHelper.accessor('assessmentName', {
    header: 'Name',
    cell: info => <Filterable column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('assessmentType', {
    header: 'Type',
    cell: info => (
      <Filterable column={info.column} value={info.getValue()}>
        <AssessmentTypeBadge type={info.getValue()} />
      </Filterable>
    )
  }),
  columnHelper.accessor('studentName', {
    header: 'Student',
    cell: info => <Filterable column={info.column} value={info.getValue()} />
  }),
  columnHelper.accessor('submissionStatus', {
    header: 'Progress',
    cell: info => (
      <Filterable column={info.column} value={info.getValue()}>
        <SubmissionStatusBadge status={info.getValue()} />
      </Filterable>
    )
  }),
  columnHelper.accessor('gradingStatus', {
    header: 'Grading',
    cell: info => (
      <Filterable column={info.column} value={info.getValue()}>
        <GradingStatusBadge status={info.getValue()} />
      </Filterable>
    )
  }),
  columnHelper.accessor(({ currentXp, maxXp }) => ({ currentXp, maxXp }), {
    header: 'XP',
    enableColumnFilter: false,
    cell: info => {
      const { currentXp, maxXp } = info.getValue();
      return (
        <Flex justifyContent="justify-start" spaceX="space-x-2">
          <Text>{currentXp}</Text>
          <Text>/</Text>
          <Text>{maxXp}</Text>
        </Flex>
      );
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: () => <GradingActions />
  })
];

type GradingSubmissionTableProps = {
  submissions: GradingOverview[];
};

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({ submissions }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const handleFilterRemove = ({ id, value }: ColumnFilter) => {
    const newFilters = columnFilters.filter(filter => filter.id !== id && filter.value !== value);
    setColumnFilters(newFilters);
  };

  return (
    <>
      {/* TODO: add global filter */}
      <Flex
        marginTop="mt-2"
        justifyContent="justify-start"
        alignItems="items-center"
        spaceX="space-x-2"
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '1.75rem' }}>
          <BpIcon icon={IconNames.FILTER_LIST} />
          <Text>
            {columnFilters.length > 0
              ? 'Filters: '
              : 'No filters applied. Click a cell to filter by its value.'}{' '}
          </Text>
        </div>
        <GradingSubmissionFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
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
              icon={() => <BpIcon icon={IconNames.ARROW_LEFT} />}
              variant="light"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            />
            <Bold>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Bold>
            <Button
              size="xs"
              icon={() => <BpIcon icon={IconNames.ARROW_RIGHT} />}
              variant="light"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
};

const Filterable: React.FC<FilterableProps> = ({ column, value, children }) => {
  const handleFilterChange = () => {
    column.setFilterValue(value);
  };

  return (
    <button type="button" onClick={handleFilterChange} style={{ padding: 0 }}>
      {children || value}
    </button>
  );
};

const GradingActions: React.FC = () => {
  return (
    <Flex justifyContent="justify-start" spaceX="space-x-2">
      <button type="button" style={{ padding: 0 }}>
        <Icon tooltip="Grade" icon={() => <BpIcon icon={IconNames.EDIT} />} variant="light" />
      </button>
      <button type="button" style={{ padding: 0 }}>
        <Icon
          tooltip="Reautograde"
          icon={() => <BpIcon icon={IconNames.REFRESH} />}
          variant="simple"
        />
      </button>
      <button type="button" style={{ padding: 0 }}>
        <Icon tooltip="Unsubmit" icon={() => <BpIcon icon={IconNames.UNDO} />} variant="simple" />
      </button>
    </Flex>
  );
};

export default GradingSubmissionTable;
