import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import {
  Button,
  Collapse,
  Divider,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useState } from 'react';
import { useSession } from 'src/commons/utils/Hooks';

import { AssessmentOverview } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import DefaultChapterSelect from './subcomponents/DefaultChapterSelect';
import ConfigureCell from './subcomponents/GroundControlConfigureCell';
import DeleteCell from './subcomponents/GroundControlDeleteCell';
import Dropzone from './subcomponents/GroundControlDropzone';
import EditCell from './subcomponents/GroundControlEditCell';
import EditTeamSizeCell from './subcomponents/GroundControlEditTeamSizeCell';
import PublishCell from './subcomponents/GroundControlPublishCell';
import ReleaseGradingCell from './subcomponents/GroundControlReleaseGradingCell';

type Props = DispatchProps;

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
  handleDeleteAssessment: (id: number) => void;
  handleUploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) => void;
  handlePublishAssessment: (togglePublishAssessmentTo: boolean, id: number) => void;
  handlePublishGradingAll: (id: number) => void;
  handleUnpublishGradingAll: (id: number) => void;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
  handleAssessmentChangeTeamSize: (id: number, maxTeamSize: number) => void;
  handleConfigureAssessment: (
    id: number,
    hasVotingFeatures: boolean,
    hasTokenCounter: boolean
  ) => void;
  handleAssignEntriesForVoting: (id: number) => void;
  handleFetchCourseConfigs: () => void;
};

const defaultColumnDefs: ColDef = {
  flex: 2,
  minWidth: 70,
  filter: true,
  resizable: true,
  sortable: true
};

const GroundControl: React.FC<Props> = props => {
  const [showDropzone, setShowDropzone] = useState(false);
  const { assessmentOverviews, assessmentConfigurations } = useSession();

  let gridApi: GridApi | undefined;

  const onGridReady = (params: GridReadyEvent) => {
    gridApi = params.api;
    gridApi.sizeColumnsToFit();

    // Sort assessments by opening date, breaking ties by later of closing dates
    gridApi.applyColumnState({
      state: [
        { colId: 'openAt', sort: 'desc' },
        { colId: 'closeAt', sort: 'desc' }
      ]
    });
  };

  const toggleDropzone = () => {
    setShowDropzone(!showDropzone);
  };

  const columnDefs: ColDef<AssessmentOverview>[] = [
    { field: 'number', headerName: 'ID', flex: 1 },
    { headerName: 'Title', field: 'title' },
    { headerName: 'Category', field: 'type' },
    {
      headerName: 'Open Date',
      field: 'openAt',
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: dateFilterComparator,
        inRangeInclusive: true
      },
      sortingOrder: ['desc', 'asc', null],
      cellRenderer: EditCell,
      cellRendererParams: {
        handleAssessmentChangeDate: props.handleAssessmentChangeDate,
        forOpenDate: true
      },
      flex: 3
    },
    {
      headerName: 'Close Date',
      field: 'closeAt',
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: dateFilterComparator,
        inRangeInclusive: true
      },
      sortingOrder: ['desc', 'asc', null],
      cellRenderer: EditCell,
      cellRendererParams: {
        handleAssessmentChangeDate: props.handleAssessmentChangeDate,
        forOpenDate: false
      },
      flex: 3
    },
    {
      headerName: 'Max Team Size',
      field: 'maxTeamSize',
      cellRenderer: EditTeamSizeCell,
      cellRendererParams: {
        onTeamSizeChange: props.handleAssessmentChangeTeamSize
      }
    },
    {
      headerName: 'Published',
      field: 'placeholderPublish' as any,
      cellRenderer: PublishCell,
      cellRendererParams: {
        handlePublishAssessment: props.handlePublishAssessment
      },
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: { padding: 0 }
    },
    {
      headerName: 'Grading',
      field: 'placeholderReleaseGrading' as any,
      cellRenderer: ReleaseGradingCell,
      cellRendererParams: {
        handlePublishGradingAll: props.handlePublishGradingAll,
        handleUnpublishGradingAll: props.handleUnpublishGradingAll
      },
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: { padding: 0 }
    },
    {
      headerName: 'Actions',
      field: 'placeholderDelete' as any,
      cellRenderer: ({ data }: { data: AssessmentOverview }) => {
        return (
          <>
            <DeleteCell data={data} handleDeleteAssessment={props.handleDeleteAssessment} />
            <ConfigureCell
              data={data}
              handleConfigureAssessment={props.handleConfigureAssessment}
              handleAssignEntriesForVoting={props.handleAssignEntriesForVoting}
            />
          </>
        );
      },
      cellRendererParams: {
        handleDeleteAssessment: props.handleDeleteAssessment
      },
      filter: false,
      resizable: false,
      sortable: false,
      cellStyle: { padding: 0 }
    }
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
        assessmentConfigurations={assessmentConfigurations}
      />
    </Collapse>
  );

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        alwaysShowHorizontalScroll={true}
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        rowData={assessmentOverviews}
        rowHeight={35}
        suppressCellFocus={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  if (!assessmentOverviews) {
    return (
      <NonIdealState
        description="Fetching assessments..."
        icon={<Spinner size={SpinnerSize.LARGE} />}
      />
    );
  }

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

/*
 *  Reference: https://www.ag-grid.com/javascript-grid-filter-date/#date-filter-comparator
 */
const dateFilterComparator = (filterDate: Date, cellValue: string) => {
  const cellDate = new Date(cellValue);
  return cellDate < filterDate ? -1 : cellDate > filterDate ? 1 : 0;
};

export default GroundControl;
