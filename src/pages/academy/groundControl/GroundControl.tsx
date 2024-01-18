import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Button, Collapse, Divider, Icon as BpIcon, Intent } from '@blueprintjs/core';
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
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text
} from '@tremor/react';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { updateGroundControlTableFilters } from 'src/commons/workspace/WorkspaceActions';

import { updateAssessmentOverviews } from '../../../commons/application/actions/SessionActions';
import {
  AssessmentConfiguration,
  AssessmentOverview
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import { AssessmentTypeBadge } from '../grading/subcomponents/GradingBadges';
import GroundControlFilters from './GroundControlFilters';
import DefaultChapterSelect from './subcomponents/DefaultChapterSelectContainer';
import DeleteCell from './subcomponents/GroundControlDeleteCell';
import Dropzone from './subcomponents/GroundControlDropzone';
import EditCell from './subcomponents/GroundControlEditCell';
import EditTeamSizeCell from './subcomponents/GroundControlEditTeamSizeCell';
import PublishCell from './subcomponents/GroundControlPublishCell';

export type GroundControlProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
  handleDeleteAssessment: (id: number) => void;
  handleUploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) => void;
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
  // handleAssessmentChangeTeamSize: (id: number, maxTeamSize: number) => void;
  handleFetchCourseConfigs: () => void;
};

export type StateProps = {
  assessmentOverviews?: AssessmentOverview[];
  assessmentConfigurations?: AssessmentConfiguration[];
};

const columnHelper = createColumnHelper<AssessmentOverview>();

const GroundControl: React.FC<GroundControlProps> = props => {
  const [showDropzone, setShowDropzone] = React.useState(false);
  const [hasChangesAssessmentOverview, setHasChangesAssessmentOverview] = React.useState(false);

  const dispatch = useDispatch();

  const tableFilters = useTypedSelector(
    state => state.workspaces.groundControl.GroundControlTableFilters
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    ...tableFilters.columnFilters
  ]);

  const session = useTypedSelector(state => state.session);
  const assessmentOverviews = React.useRef(session.assessmentOverviews);

  const toggleDropzone = () => {
    setShowDropzone(!showDropzone);
  };

  useEffect(() => {
    assessmentOverviews.current = cloneDeep(session.assessmentOverviews);
  }, [session]);

  useEffect(() => {
    // props.handleAssessmentOverviewFetch();
    // props.handleFetchCourseConfigs();
    dispatch(updateGroundControlTableFilters({ columnFilters }));
  }, [columnFilters, dispatch]);

  const EditTeamSizeCellProps = React.useMemo(() => {
    return {
      // Would have been loaded by the useEffect above
      assessmentOverviews: assessmentOverviews as React.MutableRefObject<AssessmentOverview[]>,
      setAssessmentOverview: (val: AssessmentOverview[]) => {
        assessmentOverviews.current = val;
        setHasChangesAssessmentOverview(true);
      },
      setHasChangesAssessmentOverview: setHasChangesAssessmentOverview
    };
  }, [assessmentOverviews]);

  const submitHandler = () => {
    if (hasChangesAssessmentOverview) {
      dispatch(updateAssessmentOverviews(assessmentOverviews.current!));
      setHasChangesAssessmentOverview(false);
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => <span>{info.getValue()}</span>
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <span>{info.getValue()}</span>,
      enableSorting: true,
      sortingFn: 'alphanumeric'
    }),
    columnHelper.accessor('type', {
      header: 'Category',
      cell: info => (
        <Filterable column={info.column} value={info.getValue()}>
          <AssessmentTypeBadge type={info.getValue()} />
        </Filterable>
      ),
      enableSorting: true
    }),
    columnHelper.accessor('openAt', {
      header: 'Open Date',
      cell: info => (
        <EditCell
          handleAssessmentChangeDate={props.handleAssessmentChangeDate}
          data={info.row.original}
          forOpenDate={true}
        />
      ),
      enableSorting: true
    }),
    columnHelper.accessor('closeAt', {
      header: 'Close Date',
      cell: info => (
        <EditCell
          handleAssessmentChangeDate={props.handleAssessmentChangeDate}
          data={info.row.original}
          forOpenDate={false}
        />
      ),
      enableSorting: true
    }),
    columnHelper.accessor('maxTeamSize', {
      header: 'Max Team Size',
      cell: info => (
        <EditTeamSizeCell {...EditTeamSizeCellProps} data={info.row.original}></EditTeamSizeCell>
      )
    }),
    columnHelper.accessor('isPublished', {
      header: 'Publish',
      cell: info => (
        <PublishCell
          handlePublishAssessment={props.handlePublishAssessment}
          data={info.row.original}
        />
      ),
      enableSorting: false
    }),
    columnHelper.display({
      header: 'Delete',
      size: 100,
      cell: info => (
        <DeleteCell
          handleDeleteAssessment={props.handleDeleteAssessment}
          data={info.row.original}
        />
      ),
      enableSorting: false
    })
  ];

  const controls = (
    <div className="GridControls ground-control-controls">
      <Button
        active={showDropzone}
        icon={IconNames.CLOUD_UPLOAD}
        intent={showDropzone ? Intent.PRIMARY : Intent.NONE}
        onClick={toggleDropzone}
      >
        <span className="hidden-xs">Upload assessment</span>
      </Button>
      <DefaultChapterSelect />
      <Button icon={IconNames.REFRESH} onClick={props.handleAssessmentOverviewFetch}>
        <span className="hidden-xs">Refresh assessments</span>
      </Button>
    </div>
  );

  const dropzone = (
    <Collapse isOpen={showDropzone} keepChildrenMounted={true}>
      <Dropzone
        handleUploadAssessment={props.handleUploadAssessment}
        assessmentConfigurations={props.assessmentConfigurations}
      />
    </Collapse>
  );

  const table = useReactTable({
    data: assessmentOverviews.current || [],
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

  const grid = (
    <div>
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
          <GroundControlFilters filters={columnFilters} onFilterRemove={handleFilterRemove} />
        </Flex>
      </Flex>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHeaderCell key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                  )}
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
                  {cell.getIsPlaceholder()
                    ? null
                    : flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Button
          text="Update"
          style={{ marginTop: '15px' }}
          intent={hasChangesAssessmentOverview ? Intent.WARNING : Intent.NONE}
          onClick={submitHandler}
        />
      </div>
    </div>
  );

  const content = (
    <div className="GroundControl">
      {controls}
      {dropzone}
      <Divider />
      {grid}
    </div>
  );

  const loadContent = () => {
    // Always load AssessmentOverviews and CourseConfigs to get the latest values (just in case)
    props.handleAssessmentOverviewFetch();
    props.handleFetchCourseConfigs();
  };

  return (
    <div>
      <ContentDisplay display={content} loadContentDispatch={loadContent} />
    </div>
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

export default GroundControl;
