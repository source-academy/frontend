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
  Row,
  useReactTable
} from '@tanstack/react-table';
import {
  Bold,
  Button,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput
} from '@tremor/react';
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateTeamFormationsTableFilters } from 'src/commons/workspace/WorkspaceActions';
import { TeamFormationOverview } from 'src/features/teamFormation/TeamFormationTypes';

import { AssessmentTypeBadge } from '../../teamFormation/subcomponents/TeamFormationBadges';
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
          {'  '}
        </React.Fragment>
      )),
    // <Filterable column={info.column} value={info.getValue().join(', ')} />
    filterFn: (row: Row<TeamFormationOverview>, id: string | number, filterValue: any): boolean => {
      const rowValue = row.original[id];
      return Array.isArray(rowValue) && rowValue.includes(filterValue);
      // const rowValue = row.original[id];
      // const filterValues = filterValue.split(',').map((value: string) => value.trim());
      // return (
      //   Array.isArray(rowValue) && filterValues.every((value: any) => rowValue.includes(value))
      // );
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
  const dispatch = useDispatch();
  const tableFilters = useTypedSelector(
    state => state.workspaces.teamFormation.teamFormationTableFilters
  );

  const defaultFilters = [];
  if (group && !tableFilters.columnFilters.find(filter => filter.id === 'groupName')) {
    defaultFilters.push({
      id: 'groupName',
      value: group
    });
  }

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters,
    ...defaultFilters
  ]);

  const [globalFilter, setGlobalFilter] = useState<string | null>(tableFilters.globalFilter);

  const globalFilterFn = (
    row: Row<TeamFormationOverview>,
    columnId: string | number,
    filterValue: any
  ): boolean => {
    for (const column of Object.keys(row.original)) {
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

  useEffect(() => {
    dispatch(
      updateTeamFormationsTableFilters({
        columnFilters,
        globalFilter
      })
    );
  }, [columnFilters, globalFilter, dispatch]);

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
          <TeamFormationFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </Flex>

        <TextInput
          maxWidth="max-w-sm"
          icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
          placeholder="Search for any value here..."
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
      </Table>
      <div>
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
    <button type="button" onClick={handleFilterChange} style={{ padding: 0 }}>
      {children || value}
    </button>
  );
};

export default TeamFormationTable;
