import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { Button, Collapse, Divider, Intent, SegmentedControl } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';

import {
  AssessmentConfiguration,
  AssessmentOverview
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import DefaultChapterSelect from './subcomponents/DefaultChapterSelect';
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

type State = {
  showDropzone: boolean;
};

enum GridAssessmentType {
  Contests,
  Assessments,
  Default
}

class GroundControl extends React.Component<GroundControlProps, State> {
  private assessmentColumnDefs: ColDef[];
  private contestColumnDefs: ColDef[];
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;
  private columnApi?: ColumnApi;
  private gridAssessmentType: GridAssessmentType;

  public constructor(props: GroundControlProps) {
    super(props);

    this.state = {
      showDropzone: false
    };

    this.assessmentColumnDefs = [
      {
        field: 'number',
        headerName: 'ID',
        width: 50
      },
      {
        headerName: 'Title',
        field: 'title'
      },
      {
        headerName: 'Category',
        field: 'type',
        width: 100
      },
      {
        headerName: 'Open Date',
        field: 'openAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: this.dateFilterComparator,
          inRangeInclusive: true
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: true
        },
        width: 150
      },
      {
        headerName: 'Close Date',
        field: 'closeAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: this.dateFilterComparator,
          inRangeInclusive: true
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: false
        },
        width: 150
      },
      {
        headerName: 'Publish',
        field: '',
        cellRenderer: PublishCell,
        cellRendererParams: {
          handlePublishAssessment: this.props.handlePublishAssessment
        },
        width: 100,
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: {
          padding: 0
        }
      },
      {
        headerName: 'Delete',
        field: '',
        cellRenderer: DeleteCell,
        cellRendererParams: {
          handleDeleteAssessment: this.props.handleDeleteAssessment
        },
        width: 100,
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: {
          padding: 0
        }
      }
    ];

    this.contestColumnDefs = [
      {
        field: 'number',
        headerName: 'ID',
        width: 50
      },
      {
        headerName: 'Title',
        field: 'title'
      },
      {
        headerName: 'Category',
        field: 'type',
        width: 100
      },
      {
        headerName: 'Open Date',
        field: 'openAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: this.dateFilterComparator,
          inRangeInclusive: true
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: true
        },
        width: 150
      },
      {
        headerName: 'Close Date',
        field: 'closeAt',
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: this.dateFilterComparator,
          inRangeInclusive: true
        },
        sortingOrder: ['desc', 'asc', null],
        cellRenderer: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: false
        },
        width: 150
      },
      {
        headerName: 'Publish',
        field: '',
        cellRenderer: PublishCell,
        cellRendererParams: {
          handlePublishAssessment: this.props.handlePublishAssessment
        },
        width: 100,
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: {
          padding: 0
        }
      },
      {
        headerName: 'Delete',
        field: '',
        cellRenderer: DeleteCell,
        cellRendererParams: {
          handleDeleteAssessment: this.props.handleDeleteAssessment
        },
        width: 100,
        filter: false,
        resizable: false,
        sortable: false,
        cellStyle: {
          padding: 0
        }
      }
    ];

    this.defaultColumnDefs = {
      filter: true,
      resizable: true,
      sortable: true
    };

    this.gridAssessmentType = GridAssessmentType.Assessments;
  }

  public render() {
    const controls = (
      <div className="GridControls ground-control-controls">
        <Button
          active={this.state.showDropzone}
          icon={IconNames.CLOUD_UPLOAD}
          intent={this.state.showDropzone ? Intent.PRIMARY : Intent.NONE}
          onClick={this.toggleDropzone}
        >
          <span className="hidden-xs">Upload assessment</span>
        </Button>
        <DefaultChapterSelect />
        <Button icon={IconNames.REFRESH} onClick={this.props.handleAssessmentOverviewFetch}>
          <span className="hidden-xs">Refresh assessments</span>
        </Button>
      </div>
    );

    const dropzone = (
      <Collapse isOpen={this.state.showDropzone} keepChildrenMounted={true}>
        <Dropzone
          handleUploadAssessment={this.props.handleUploadAssessment}
          assessmentConfigurations={this.props.assessmentConfigurations}
        />
      </Collapse>
    );

    const grid = (
      <div className="Grid ag-grid-parent ag-theme-balham">
        <SegmentedControl
          options={[
            {
              label: 'Assessments',
              value: 'assessments'
            },
            {
              label: 'Contests',
              value: 'contests'
            }
          ]}
          onValueChange={this.handleGridAssessmentTypeChange}
          defaultValue="assessments"
          small={true}
        />
        <AgGridReact
          domLayout={'autoHeight'}
          columnDefs={
            this.gridAssessmentType === GridAssessmentType.Assessments
              ? this.assessmentColumnDefs
              : this.gridAssessmentType === GridAssessmentType.Contests
              ? this.contestColumnDefs
              : null
          }
          defaultColDef={this.defaultColumnDefs}
          onGridReady={this.onGridReady}
          onGridSizeChanged={this.resizeGrid}
          rowData={this.filterAssessmentOverviews(
            this.props.assessmentOverviews,
            this.gridAssessmentType
          )}
          rowHeight={30}
          suppressCellFocus={true}
          suppressMovableColumns={true}
          suppressPaginationPanel={true}
        />
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

    return (
      <div>
        <ContentDisplay display={content} loadContentDispatch={this.loadContent} />
      </div>
    );
  }

  private loadContent = () => {
    // Always load AssessmentOverviews and CourseConfigs to get the latest values (just in case)
    this.props.handleAssessmentOverviewFetch();
    this.props.handleFetchCourseConfigs();
  };

  /*
   *  Reference: https://www.ag-grid.com/javascript-grid-filter-date/#date-filter-comparator
   */
  private dateFilterComparator = (filterDate: Date, cellValue: string) => {
    const cellDate = new Date(cellValue);

    return cellDate < filterDate ? -1 : cellDate > filterDate ? 1 : 0;
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();

    // Sort assessments by opening date, breaking ties by later of closing dates
    this.columnApi.applyColumnState({
      state: [
        { colId: 'openAt', sort: 'desc' },
        { colId: 'closeAt', sort: 'desc' }
      ]
    });
  };

  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };

  private toggleDropzone = () => {
    this.setState({ showDropzone: !this.state.showDropzone });
  };

  private handleGridAssessmentTypeChange = (assessmentType: String) => {
    this.gridAssessmentType =
      assessmentType === 'assessments'
        ? GridAssessmentType.Assessments
        : assessmentType === 'contests'
        ? GridAssessmentType.Contests
        : GridAssessmentType.Default; // Should never reach this point as long as there is appropriate assessmentType
  };

  private filterAssessmentOverviews = (
    assessmentOverviews: AssessmentOverview[] | undefined,
    gridAssessmentType: GridAssessmentType
  ) => {
    return assessmentOverviews === undefined
      ? undefined
      : gridAssessmentType === GridAssessmentType.Contests
      ? assessmentOverviews.filter(assessmentOverview => assessmentOverview.isContestRelated)
      : gridAssessmentType === GridAssessmentType.Assessments
      ? assessmentOverviews.filter(assessmentOverview => !assessmentOverview.isContestRelated)
      : undefined;
  };
}

export default GroundControl;
