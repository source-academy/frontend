import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Button, Collapse, Divider, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import * as React from 'react';

import {
  AssessmentConfiguration,
  AssessmentOverview
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
  handleFetchAssessmentConfigs: () => void;
};

export type StateProps = {
  assessmentOverviews?: AssessmentOverview[];
  assessmentConfigurations?: AssessmentConfiguration[];
};

type State = {
  showDropzone: boolean;
};

class GroundControl extends React.Component<GroundControlProps, State> {
  private columnDefs: ColDef[];
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;

  public constructor(props: GroundControlProps) {
    super(props);

    this.state = {
      showDropzone: false
    };

    this.columnDefs = [
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
        cellRendererFramework: EditCell,
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
        cellRendererFramework: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: false
        },
        width: 150
      },
      {
        headerName: 'Publish',
        field: '',
        cellRendererFramework: PublishCell,
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
        cellRendererFramework: DeleteCell,
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
        <AgGridReact
          domLayout={'autoHeight'}
          columnDefs={this.columnDefs}
          defaultColDef={this.defaultColumnDefs}
          onGridReady={this.onGridReady}
          onGridSizeChanged={this.resizeGrid}
          rowData={this.props.assessmentOverviews}
          rowHeight={30}
          suppressCellSelection={true}
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
    // Always load AssessmentOverviews and AssessmentConfigs as course might have changed
    this.props.handleAssessmentOverviewFetch();
    this.props.handleFetchAssessmentConfigs();
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
    this.gridApi.sizeColumnsToFit();

    // Sort assessments by opening date, breaking ties by later of closing dates
    this.gridApi.setSortModel([
      { colId: 'openAt', sort: 'desc' },
      { colId: 'closeAt', sort: 'desc' }
    ]);
  };

  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };

  private toggleDropzone = () => {
    this.setState({ showDropzone: !this.state.showDropzone });
  };
}

export default GroundControl;
