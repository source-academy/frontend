import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Button, Collapse, Divider, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
import * as React from 'react';

import {
  AssessmentConfiguration,
  AssessmentOverview,
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import DefaultChapterSelect from './subcomponents/DefaultChapterSelectContainer';
import DeleteCell from './subcomponents/GroundControlDeleteCell';
import Dropzone from './subcomponents/GroundControlDropzone';
import EditCell from './subcomponents/GroundControlEditCell';
import PublishCell from './subcomponents/GroundControlPublishCell';

export type GroundControlProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
  handleDeleteAssessment: (id: number) => void;
  handleUploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) => void;
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
  handleFetchCourseConfigs: () => void;
};

export type StateProps = {
  assessmentOverviews?: AssessmentOverview[];
  assessmentConfigurations?: AssessmentConfiguration[];
};

const columnHelper = createColumnHelper<AssessmentOverview>();

const GroundControl: React.FC<GroundControlProps> = (props) => {
  const [showDropzone, setShowDropzone] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([])

  const toggleDropzone = () => {
    setShowDropzone(!showDropzone);
  };

  React.useEffect(() => {
    props.handleAssessmentOverviewFetch();
    props.handleFetchCourseConfigs();
  }, []);

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <span>{info.getValue()}</span>,
      enableSorting: true,
      sortingFn:'alphanumeric'
    }),
    columnHelper.accessor('type', {
      header: 'Category',
      cell: info => <span>{info.getValue()}</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('openAt', {
      header: 'Open Date',
      cell: info => <EditCell handleAssessmentChangeDate={props.handleAssessmentChangeDate} data={info.row.original} forOpenDate={true} />,
      enableSorting: true,
    }),
    columnHelper.accessor('closeAt', {
      header: 'Close Date',
      cell: info => <EditCell handleAssessmentChangeDate={props.handleAssessmentChangeDate} data={info.row.original} forOpenDate={false} />,
      enableSorting: true,
    }),
    columnHelper.accessor('isPublished', {
      header: 'Publish',
      cell: info => <PublishCell handlePublishAssessment={props.handlePublishAssessment} data={info.row.original} />,
      enableSorting: false,
    }),
    columnHelper.display({
      header: 'Delete',
      size: 100,
      cell: info => <DeleteCell handleDeleteAssessment={props.handleDeleteAssessment} data={info.row.original} />,
      enableSorting: false,
    }),
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
    data: props.assessmentOverviews || [],
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const grid = (
    <div>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : <div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>}
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

  const render = () => {
    return (
      <div>
        <ContentDisplay display={content} loadContentDispatch={loadContent} />
      </div>
    );
  };

  return render();
}
export default GroundControl;
