import { Button, HTMLTable, Icon as BpIcon, InputGroup } from '@blueprintjs/core';
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
  Row,
  useReactTable
} from '@tanstack/react-table';
import React, { useState } from 'react';
import GradingFlex from 'src/commons/grading/GradingFlex';
import GradingText from 'src/commons/grading/GradingText';
import { objectKeys } from 'src/commons/utils/TypeHelper';
import { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

import { AssessmentTypeBadge } from '../../grading/subcomponents/GradingBadges';
import TeamFormationFilters from '../../teamFormation/subcomponents/TeamFormationFilters';
import TeamFormationActions from './TeamFormationActions';

const columnHelper = createColumnHelper<TeamFormationOverview>();

const columns = [
  columnHelper.accessor('assessmentName', {
    header: 'Assessment',
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
  columnHelper.accessor('studentNames', {
    header: 'Students',
    cell: info =>
      info.getValue().map((name: string, index: number) => (
        <React.Fragment key={index}>
          <Filterable column={info.column} value={name}>
            {name}
          </Filterable>
          {', '}
        </React.Fragment>
      )),
    filterFn: (row, id: string | number, filterValue: any): boolean => {
      const rowValue = row.original[id as keyof typeof row.original];
      if (typeof rowValue === 'string' || typeof rowValue === 'number') {
        return rowValue === filterValue;
      }
      return rowValue.some(v => v === filterValue);
    }
  }),
  columnHelper.accessor(({ teamId }) => ({ teamId }), {
    header: 'Actions',
    enableColumnFilter: false,
    cell: info => {
      const { teamId } = info.getValue();
      return <TeamFormationActions teamId={teamId} />;
    }
  })
];

type TeamFormationTableProps = {
  group: string | null;
  teams: TeamFormationOverview[];
};

const TeamFormationTable: React.FC<TeamFormationTableProps> = ({ group, teams }) => {
  const defaultFilters = [];
  if (group) {
    defaultFilters.push({
      id: 'groupName',
      value: group
    });
  }

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([...defaultFilters]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);

  const globalFilterFn = (
    row: Row<TeamFormationOverview>,
    columnId: string | number,
    filterValue: any
  ): boolean => {
    for (const column of objectKeys(row.original)) {
      const rowValue = row.original[column];

      if (Array.isArray(rowValue)) {
        for (const value of rowValue) {
          if (typeof value === 'string' && value.includes(filterValue)) {
            return true;
          }
        }
      } else if (typeof rowValue === 'string' && rowValue.includes(filterValue)) {
        return true;
      }
    }

    return false;
  };

  const table = useReactTable({
    data: teams,
    columns,
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
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
      <GradingFlex
        justifyContent="space-between"
        alignItems="center"
        style={{ marginTop: '0.5rem' }}
      >
        <GradingFlex alignItems="center" style={{ columnGap: '0.5rem' }}>
          <GradingFlex alignItems="center" style={{ columnGap: '0.5rem', height: '1.75rem' }}>
            <BpIcon icon={IconNames.FILTER_LIST} />
            <GradingText>
              {columnFilters.length > 0
                ? 'Filters: '
                : 'No filters applied. Click on any cell to filter by its value.'}{' '}
            </GradingText>
          </GradingFlex>
          <TeamFormationFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </GradingFlex>

        <InputGroup
          style={{ maxWidth: '14rem' }}
          leftIcon={IconNames.SEARCH}
          placeholder="Search for any value here..."
          onChange={e => setGlobalFilter(e.target.value)}
        />
      </GradingFlex>
      <HTMLTable style={{ marginTop: '0.5rem', width: '100%' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      <div>
        <GradingFlex justifyContent="center" style={{ columnGap: '0.75rem' }}>
          <Button
            variant="minimal"
            icon={IconNames.ARROW_LEFT}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <GradingText style={{ fontWeight: 'bold' }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </GradingText>
          <Button
            variant="minimal"
            icon={IconNames.ARROW_RIGHT}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
        </GradingFlex>
      </div>
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
    <Button variant="minimal" onClick={handleFilterChange} style={{ padding: 0 }}>
      {children || value}
    </Button>
  );
};

export default TeamFormationTable;
