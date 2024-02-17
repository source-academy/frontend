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
import { GradingStatuses } from 'src/commons/assessment/AssessmentTypes';
import SimpleDropdown from 'src/commons/SimpleDropdown';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateSubmissionsTableFilters } from 'src/commons/workspace/WorkspaceActions';
import { GradingOverview } from 'src/features/grading/GradingTypes';

import GradingActions from './GradingActions';
import { AssessmentTypeBadge, GradingStatusBadge, SubmissionStatusBadge } from './GradingBadges';
import GradingSubmissionFilters from './GradingSubmissionFilters';


type GradingSubmissionTableProps = {
  totalRows: number;
  submissions: GradingOverview[];
  // TODO: Abstract pageParams object into a useable type.
  updateEntries: (group: boolean, pageParams: {offset: number, pageSize: number}, filterParams: any) => void;
};

const GradingSubmissionTable: React.FC<GradingSubmissionTableProps> = ({ totalRows, submissions, updateEntries }) => {
  /* TODO: implement functionality for submission filtering by groups using the following state.
  const {
    group
  } = useSession();
  */

  // Nesting of Filterable here allows for mutual re-rendering with the dropdown options tab if either of them update.
  // This is needed because a filter change is accompanied with a page reset.
  type FilterableProps = {
    column: Column<any, unknown>;
    value: string;
    children?: React.ReactNode;
  };

  const tableFilters = useTypedSelector(state => state.workspaces.grading.submissionsTableFilters);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(tableFilters.globalFilter);

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);


  const columnHelper = createColumnHelper<GradingOverview>();

  
  const Filterable: React.FC<FilterableProps> = ({ column, value, children }) => {
    const handleFilterChange = () => {
      column.setFilterValue(value);
      setPage(0);
    };
  
    return (
      <button type="button" onClick={handleFilterChange} style={{ padding: 0 }}>
        {children || value}
      </button>
    );
  };


  const columns = [
    columnHelper.accessor('assessmentName', {
      header: 'Name',
      cell: info => <Filterable column={info.column} value={info.getValue()}/>
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
      cell: info => <Filterable column={info.column} value={info.getValue()}/>
    }),
    columnHelper.accessor('studentUsername', {
      header: 'Username',
      cell: info => <Filterable column={info.column} value={info.getValue()}/>
    }),
    columnHelper.accessor('groupName', {
      header: 'Group',
      cell: info => <Filterable column={info.column} value={info.getValue()}/>
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
        <Filterable column={info.column} value={info.getValue()} >
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
  // TEMP IMPLEMENTATION. Values currently hardcoded with knowledge of what a ColumnFilter is.
  // TODO: remove hardcoding conversion of all submissions to column filter. it is a hacky workaround.
  // TODO: implement reversible backend-frontend name conversion for use in RequestsSaga and here, remove hardcode.
  // TODO: make a controller component, like in the achievements page, to handle conversion of page state into JSON.
  const backendFilterParams = (columnFilters: ColumnFilter[], showAllSubmissions: boolean): any => {
    return columnFilters
        .concat([{ id: (showAllSubmissions ? "paramIgnoredByBackend" : "gradingStatus"), value: GradingStatuses.none}])
        .map((column: ColumnFilter) => {
          // TODO: change all references to column properties in backend saga to backend name to reduce 
          // un-needed hardcode conversion, ensuring that places that reference it are updated.
          switch (column.id) {
            case "assessmentName": 
              return {"title": column.value};
            case "assessmentType":
              return {"type": column.value};
            case "studentName":
              return {"name": column.value};
            case "studentUsername":
              return {"username": column.value};
            case "submissionStatus":
              return {"status": column.value};
            case "gradingStatus":
              if (column.value === GradingStatuses.none) {
                return {
                  "isManuallyGraded": true,
                  "status": "submitted",
                  "numGraded": 0,
                };
              } else if (column.value === GradingStatuses.graded) {
                // TODO: coordinate with backend on subquerying to implement the third query
                // currently ignored by backend as of 16 Feb 24 commit
                return {
                  "isManuallyGraded": true,
                  "status": "submitted",
                  "numGradedEqualToTotal": true,  
                };
              } else {
                // case: excluded or grading. Not implemented yet.
                return {};
              }
            default:
              return column;
          }
        })
        .reduce(Object.assign, {});
  }
  
  const pageSizeOptions = [
    { value: 1, label: '1' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  // TODO: implement isAdmin functionality
  const [showAllGroups, setShowAllGroups] = useState(false);
  const groupOptions = [
    { value: false, label: 'my groups' },
    { value: true, label: 'all groups' }
  ];

  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const showSubmissionOptions = [
    { value: false, label: 'ungraded' },
    { value: true, label: 'all' }
  ];

  // tells page to ask for new entries from main page when its state changes.
  useEffect(() => {
    updateEntries(showAllGroups, pageParams(), backendFilterParams(columnFilters, showAllSubmissions));
  }, [showAllGroups, page, pageSize, columnFilters, showAllSubmissions]);


  return (
    <>
      <Flex justifyContent="justify-start" marginTop="mt-2" spaceX="space-x-2">
        <Text>Viewing</Text>
        <SimpleDropdown
          options={showSubmissionOptions}
          selectedValue={showAllSubmissions}
          onClick={setShowAllSubmissions}
          popoverProps={{ position: Position.BOTTOM }}
          buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
        />
        <Text>Submissions from</Text>
        <SimpleDropdown
          options={groupOptions}
          selectedValue={showAllGroups}
          onClick={setShowAllGroups}
          popoverProps={{ position: Position.BOTTOM }}
          buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
        />
        <Text>Entries per page</Text>
        <SimpleDropdown
          options={pageSizeOptions}
          selectedValue={pageSize}
          onClick={setPageSize}
          popoverProps={{ position: Position.BOTTOM }}
          buttonProps={{ minimal: true, rightIcon: 'caret-down' }}
        />
      </Flex>
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

          </Flex>
        </Footer>
      </Table>
    </>
  );
};

export default GradingSubmissionTable;
