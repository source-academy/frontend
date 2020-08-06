import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Button, Collapse, Divider, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import * as React from 'react';

import { AssessmentOverview } from '../../../commons/assessment/AssessmentTypes';
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
  handleUploadAssessment: (file: File, forceUpdate: boolean) => void;
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
};

export type StateProps = {
  assessmentOverviews?: AssessmentOverview[];
};

type State = {
  displayConfirmation: boolean;
  forceUpdate: boolean;
  showDropzone: boolean;
};

class GroundControl extends React.Component<GroundControlProps, State> {
  private columnDefs: ColDef[];
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;

  public constructor(props: GroundControlProps) {
    super(props);

    this.state = {
      displayConfirmation: false,
      forceUpdate: false,
      showDropzone: false
    };

    this.columnDefs = [
      {
        headerName: 'Title',
        field: 'title'
      },
      {
        headerName: 'Category',
        field: 'category',
        width: 100
      },
      {
        headerName: 'Open Date',
        field: 'openAt',
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
          handleUploadAssessment={this.handleUploadAssessment}
          toggleDisplayConfirmation={this.toggleDisplayConfirmation}
          toggleForceUpdate={this.toggleForceUpdate}
          displayConfirmation={this.state.displayConfirmation}
          forceUpdate={this.state.forceUpdate}
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
          pagination={true}
          paginationPageSize={25}
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
        <ContentDisplay
          display={content}
          loadContentDispatch={this.conditionallyFetchAssessmentOverviews}
        />
      </div>
    );
  }

  private conditionallyFetchAssessmentOverviews = () => {
    if (!this.props.assessmentOverviews) {
      // If assessment overviews are not loaded, fetch them
      this.props.handleAssessmentOverviewFetch();
    }
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  };

  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };

  private handleUploadAssessment = (file: File) => {
    this.props.handleUploadAssessment(file, this.state.forceUpdate);
    this.setState({ forceUpdate: false });
  };

  private toggleDisplayConfirmation = () => {
    this.setState({ displayConfirmation: !this.state.displayConfirmation });
  };

  private toggleDropzone = () => {
    this.setState({ showDropzone: !this.state.showDropzone });
  };

  private toggleForceUpdate = () => {
    this.setState({ forceUpdate: !this.state.forceUpdate });
  };
}

export default GroundControl;
