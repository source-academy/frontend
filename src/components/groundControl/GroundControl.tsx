import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import { sortBy } from 'lodash';
import * as React from 'react';

import { getPrettyDate } from '../../utils/dateHelpers';
import { IAssessmentOverview } from '../assessment/assessmentShape';
import ContentDisplay from '../commons/ContentDisplay';
import DeleteCell from './DeleteCell';
import Dropzone from './Dropzone';
import EditCell from './EditCell';
import PublishCell from './PublishCell';

export interface IDispatchProps {
  handleAssessmentOverviewFetch: () => void;
  handleDeleteAssessment: (id: number) => void;
  handleUploadAssessment: (file: File, forceUpdate: boolean) => void;
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
}

export interface IGroundControlAssessmentOverview extends IAssessmentOverview {
  prettyOpenAt: string;
  prettyCloseAt: string;
  formattedOpenAt: Date;
  formattedCloseAt: Date;
}

export interface IStateProps {
  assessmentOverviews: IAssessmentOverview[];
}

export interface IGroundControlProps extends IDispatchProps, IStateProps {}

interface IGroundControlState {
  forceUpdate: boolean;
  displayConfirmation: boolean;
}

class GroundControl extends React.Component<IGroundControlProps, IGroundControlState> {
  private columnDefs: ColDef[];
  private gridApi?: GridApi;

  public constructor(props: IGroundControlProps) {
    super(props);
    this.state = {
      forceUpdate: false,
      displayConfirmation: false
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
        field: '',
        cellRendererFramework: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: true
        },
        width: 150,
        suppressSorting: true,
        suppressMovable: true,
        suppressMenu: true,
        cellStyle: {
          padding: 0
        }
      },
      {
        headerName: 'Close Date',
        field: '',
        cellRendererFramework: EditCell,
        cellRendererParams: {
          handleAssessmentChangeDate: this.props.handleAssessmentChangeDate,
          forOpenDate: false
        },
        width: 150,
        suppressSorting: true,
        suppressMovable: true,
        suppressMenu: true,
        cellStyle: {
          padding: 0
        }
      },
      {
        headerName: 'Publish',
        field: '',
        cellRendererFramework: PublishCell,
        cellRendererParams: {
          handlePublishAssessment: this.props.handlePublishAssessment
        },
        width: 100,
        suppressSorting: true,
        suppressMovable: true,
        suppressMenu: true,
        cellStyle: {
          padding: 0
        },
        hide: !this.props.handlePublishAssessment
      },
      {
        headerName: 'Delete',
        field: '',
        cellRendererFramework: DeleteCell,
        cellRendererParams: {
          handleDeleteAssessment: this.props.handleDeleteAssessment
        },
        width: 100,
        suppressSorting: true,
        suppressMovable: true,
        suppressMenu: true,
        cellStyle: {
          padding: 0
        },
        hide: !this.props.handleDeleteAssessment
      }
    ];
  }

  public componentDidUpdate(prevProps: IGroundControlProps) {
    if (
      this.gridApi &&
      this.props.assessmentOverviews.length !== prevProps.assessmentOverviews.length
    ) {
      this.gridApi.setRowData(this.sortByCategoryAndDate());
    }
  }

  public render() {
    const data = this.sortByCategoryAndDate();
    const Grid = () => (
      <div className="GradingContainer">
        <div className="Grading ag-grid-parent ag-theme-balham">
          <AgGridReact
            gridAutoHeight={true}
            enableColResize={true}
            enableSorting={true}
            enableFilter={true}
            columnDefs={this.columnDefs}
            onGridReady={this.onGridReady}
            onGridSizeChanged={this.resizeGrid}
            rowData={data}
            rowHeight={30}
            pagination={true}
            paginationPageSize={25}
            suppressMovableColumns={true}
            suppressPaginationPanel={true}
          />
        </div>
      </div>
    );

    const display = (
      <div className="GroundControl">
        <Dropzone
          handleUploadAssessment={this.handleUploadAssessment}
          toggleForceUpdate={this.toggleForceUpdate}
          toggleDisplayConfirmation={this.toggleDisplayConfirmation}
          forceUpdate={this.state.forceUpdate}
          displayConfirmation={this.state.displayConfirmation}
        />
        <Grid />
      </div>
    );

    return (
      <div>
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
      </div>
    );
  }

  private sortByCategoryAndDate = () => {
    if (!this.props.assessmentOverviews) {
      return [];
    }

    const overview: IGroundControlAssessmentOverview[] = this.props.assessmentOverviews
      .slice()
      .map(assessmentOverview => {
        const clone: IGroundControlAssessmentOverview = JSON.parse(
          JSON.stringify(assessmentOverview)
        );
        clone.prettyCloseAt = getPrettyDate(clone.closeAt);
        clone.prettyOpenAt = getPrettyDate(clone.openAt);
        clone.formattedOpenAt = new Date(Date.parse(clone.openAt));
        clone.formattedCloseAt = new Date(Date.parse(clone.closeAt));
        return clone;
      });
    return sortBy(overview, ['category', 'formattedOpenAt', 'formattedCloseAt']);
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

  private toggleForceUpdate = () => {
    this.setState({ forceUpdate: !this.state.forceUpdate });
  };

  private toggleDisplayConfirmation = () => {
    this.setState({ displayConfirmation: !this.state.displayConfirmation });
  };
}

export default GroundControl;
