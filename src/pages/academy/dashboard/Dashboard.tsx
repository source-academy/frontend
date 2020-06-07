import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { AgGridReact } from 'ag-grid-react';
import * as React from 'react';

import ContentDisplay from '../../../commons/ContentDisplay';
import { GroupOverview, LeaderBoardInfo } from '../../../features/dashboard/DashboardTypes';
import { GradingOverview } from '../../../features/grading/GradingTypes';

type DashboardProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchGradingOverviews: (filterToGroup?: boolean) => void;
  handleFetchGroupOverviews: () => void;
};

export type StateProps = {
  gradingOverviews: GradingOverview[];
  groupOverviews: GroupOverview[];
};

type State = {
  filterValue: string;
  groupFilterEnabled: boolean;
  currPage: number;
  maxPages: number;
  rowCountString: string;
  isBackDisabled: boolean;
  isForwardDisabled: boolean;
};

class Dashboard extends React.Component<DashboardProps, State> {
  private columnDefs: ColDef[];
  private gridApi?: GridApi;

  public constructor(props: DashboardProps) {
    super(props);
    this.columnDefs = [
      {
        headerName: 'Avenger',
        field: 'avengerName',
        width: 100
      },
      {
        headerName: 'Number of Ungraded Missions',
        field: 'numOfUngradedMissions'
      },
      {
        headerName: 'Number of Submitted Missions',
        field: 'totalNumOfMissions'
      },
      {
        headerName: 'Number of Ungraded Quests',
        field: 'numOfUngradedQuests'
      },
      {
        headerName: 'Number of Submitted Quests',
        field: 'totalNumOfQuests'
      }
    ];
  }

  public componentDidMount() {
    this.props.handleFetchGroupOverviews();
  }

  public componentDidUpdate(prevProps: DashboardProps, prevState: State) {
    if (this.gridApi && this.props.gradingOverviews.length !== prevProps.gradingOverviews.length) {
      this.gridApi.setRowData(this.updateLeaderBoard());
    }
  }

  public handleFetchGradingOverviews = () => {
    this.props.handleFetchGradingOverviews(false);
  };

  public render() {
    const data = this.updateLeaderBoard();
    const grid = (
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

    return (
      <div>
        <ContentDisplay display={grid} loadContentDispatch={this.handleFetchGradingOverviews} />
      </div>
    );
  }

  private updateLeaderBoard = () => {
    if (this.props.groupOverviews.length === 0) {
      return [];
    }
    const gradingOverview: GradingOverview[] = this.filterSubmissionsByCategory();
    const filteredData: LeaderBoardInfo[] = [];
    for (const current of gradingOverview) {
      if (current.submissionStatus !== 'submitted') {
        continue;
      }
      const groupName = current.groupName;
      const groupOverviews = this.props.groupOverviews;
      const index = groupOverviews.findIndex(x => x.groupName === groupName);

      if (index !== -1) {
        if (filteredData[index] === undefined) {
          filteredData[index] = {
            avengerName: groupOverviews[index].avengerName,
            numOfUngradedMissions: 0,
            totalNumOfMissions: 0,
            numOfUngradedQuests: 0,
            totalNumOfQuests: 0
          };
        }

        const currentEntry = filteredData[index];
        const gradingStatus = current.gradingStatus;

        if (current.assessmentCategory === 'Mission') {
          if (gradingStatus === 'none' || gradingStatus === 'grading') {
            currentEntry.numOfUngradedMissions++;
          }
          currentEntry.totalNumOfMissions++;
        } else {
          if (gradingStatus === 'none' || gradingStatus === 'grading') {
            currentEntry.numOfUngradedQuests++;
          }
          currentEntry.totalNumOfQuests++;
        }
      }
    }
    return filteredData;
  };

  private filterSubmissionsByCategory = () => {
    if (!this.props.gradingOverviews) {
      return [];
    }
    return (this.props.gradingOverviews as GradingOverview[]).filter(
      sub => sub.assessmentCategory === 'Sidequest' || sub.assessmentCategory === 'Mission'
    );
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
}

export default Dashboard;
