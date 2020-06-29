import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { AgGridReact } from 'ag-grid-react';
import * as React from 'react';

import ContentDisplay from '../../../commons/ContentDisplay';
import { GradingSummary } from '../../../features/dashboard/DashboardTypes';

type DashboardProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchGradingSummary: () => void;
};

export type StateProps = {
  gradingSummary: GradingSummary;
};

class Dashboard extends React.Component<DashboardProps> {
  private columnDefs: ColDef[];
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;

  public constructor(props: DashboardProps) {
    super(props);

    this.columnDefs = [
      {
        headerName: 'Group',
        field: 'groupName',
        width: 80,
        sort: 'asc'
      },
      {
        headerName: 'Avenger',
        field: 'leaderName'
      },
      {
        headerName: 'Ungraded Missions',
        field: 'ungradedMissions'
      },
      {
        headerName: 'Submitted Missions',
        field: 'submittedMissions'
      },
      {
        headerName: 'Ungraded Quests',
        field: 'ungradedSidequests'
      },
      {
        headerName: 'Submitted Quests',
        field: 'submittedSidequests'
      }
    ];

    this.defaultColumnDefs = {
      filter: true,
      resizable: true,
      sortable: true
    };
  }

  public componentDidUpdate(prevProps: DashboardProps) {
    if (this.gridApi && this.props.gradingSummary.length !== prevProps.gradingSummary.length) {
      this.gridApi.setRowData(this.props.gradingSummary);
    }
  }

  public handleFetchGradingSummary = () => {
    this.props.handleFetchGradingSummary();
  };

  public render() {
    const grid = (
      <div className="GradingContainer">
        <div className="Grading ag-grid-parent ag-theme-balham">
          <AgGridReact
            domLayout={'autoHeight'}
            columnDefs={this.columnDefs}
            defaultColDef={this.defaultColumnDefs}
            onGridReady={this.onGridReady}
            onFirstDataRendered={this.resizeGrid}
            onGridSizeChanged={this.resizeGrid}
            rowData={this.props.gradingSummary}
            rowHeight={30}
            suppressMovableColumns={true}
          />
        </div>
      </div>
    );

    return (
      <div>
        <ContentDisplay display={grid} loadContentDispatch={this.handleFetchGradingSummary} />
      </div>
    );
  }

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
  };

  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };
}

export default Dashboard;
