import {
  Button,
  Colors,
  Divider,
  FormGroup,
  InputGroup,
  Intent,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid';
import { AgGridReact } from 'ag-grid-react';
import { ValueFormatterParams } from 'ag-grid/dist/lib/entities/colDef';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import GradingWorkspaceContainer from '../../../containers/academy/grading/GradingWorkspaceContainer';
import NotificationBadge from '../../../containers/notification/NotificationBadge';
import { stringParamToInt } from '../../../utils/paramParseHelpers';
import ContentDisplay from '../../commons/ContentDisplay';
import { filterNotificationsBySubmission } from '../../notification/NotificationHelpers';
import { Notification, NotificationFilterFunction } from '../../notification/notificationShape';
import EditGradingCell from './EditGradingCell';
import GradeCell from './GradeCell';
import { GradingOverview, GradingOverviewWithNotifications } from './gradingShape';
import GradingStatusCell from './GradingStatusCell';
import { OwnProps as GradingWorkspaceProps } from './GradingWorkspace';
import UnsubmitCell from './UnsubmitCell';
import XPCell from './XPCell';

type State = {
  filterValue: string;
  groupFilterEnabled: boolean;
  currPage: number;
  maxPages: number;
  rowCountString: string;
  isBackDisabled: boolean;
  isForwardDisabled: boolean;
};

type GradingNavLinkProps = {
  data: GradingOverviewWithNotifications;
};

interface IGradingProps
  extends IDispatchProps,
    IStateProps,
    RouteComponentProps<IGradingWorkspaceParams> {}

export interface IGradingWorkspaceParams {
  submissionId?: string;
  questionId?: string;
}

export interface IDispatchProps {
  handleAcknowledgeNotifications: (withFilter?: NotificationFilterFunction) => void;
  handleFetchGradingOverviews: (filterToGroup?: boolean) => void;
  handleUnsubmitSubmission: (submissionId: number) => void;
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[];
  notifications: Notification[];
}

/** Component to render in table - grading status */
const GradingStatus = (props: GradingNavLinkProps) => {
  return <GradingStatusCell data={props.data} />;
};

/** Component to render in table - marks */
const GradingMarks = (props: GradingNavLinkProps) => {
  return <GradeCell data={props.data} />;
};

/** Component to render in table - XP */
const GradingExp = (props: GradingNavLinkProps) => {
  return <XPCell data={props.data} />;
};

const NotificationBadgeCell = (props: GradingNavLinkProps) => {
  return (
    <NotificationBadge
      notificationFilter={filterNotificationsBySubmission(props.data.submissionId)}
    />
  );
};

class Grading extends React.Component<IGradingProps, State> {
  private columnDefs: ColDef[];
  private gridApi?: GridApi;

  public constructor(props: IGradingProps) {
    super(props);

    this.columnDefs = [
      {
        headerName: '',
        field: 'notifications',
        cellRendererFramework: NotificationBadgeCell,
        width: 30,
        suppressResize: true,
        suppressMovable: true,
        suppressMenu: true,
        suppressSizeToFit: true
      },
      { headerName: 'Assessment Name', field: 'assessmentName' },
      { headerName: 'Category', field: 'assessmentCategory', maxWidth: 100 },
      { headerName: 'Student Name', field: 'studentName' },
      {
        headerName: 'Group',
        field: 'groupName',
        maxWidth: 100
      },
      {
        headerName: 'Status',
        field: 'submissionStatus',
        maxWidth: 100,
        valueFormatter: (params: ValueFormatterParams) => {
          const str = params.value as string;
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        cellStyle: (params: GradingNavLinkProps) => {
          if (params.data.submissionStatus === 'submitted') {
            return { backgroundColor: Colors.GREEN5 };
          }
          return { backgroundColor: Colors.RED5 };
        }
      },
      {
        headerName: 'Grading',
        field: 'gradingStatus',
        cellRendererFramework: GradingStatus,
        maxWidth: 110
      },
      {
        headerName: 'Grade',
        field: '',
        cellRendererFramework: GradingMarks,
        maxWidth: 100,
        cellStyle: (params: GradingNavLinkProps) => {
          if (params.data.currentGrade < params.data.maxGrade) {
            return { backgroundColor: Colors.RED5 };
          }
          return {};
        },
        comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
          if (nodeA && nodeB) {
            return nodeA.data.currentGrade - nodeB.data.currentGrade;
          }
          return valueA - valueB;
        }
      },
      {
        headerName: 'XP',
        field: '',
        cellRendererFramework: GradingExp,
        maxWidth: 100,
        comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
          if (nodeA && nodeB) {
            return nodeA.data.currentXp - nodeB.data.currentXp;
          }
          return valueA - valueB;
        }
      },
      {
        headerName: 'Edit',
        cellRendererFramework: EditGradingCell,
        cellRendererParams: {
          handleAcknowledgeNotifications: this.props.handleAcknowledgeNotifications
        },
        width: 65,
        suppressFilter: true,
        suppressSorting: true,
        suppressSizeToFit: true,
        suppressResize: true,
        cellStyle: {
          padding: 0
        }
      },
      {
        headerName: 'Unsubmit',
        colId: 'Unsubmit',
        width: 100,
        field: '',
        cellRendererFramework: UnsubmitCell,
        cellRendererParams: {
          handleUnsubmitSubmission: this.props.handleUnsubmitSubmission
        },
        suppressFilter: true,
        suppressSorting: true,
        suppressSizeToFit: true,
        suppressResize: true,
        cellStyle: {
          padding: 0
        }
      },
      { headerName: 'Question Count', field: 'questionCount', hide: true },
      { headerName: 'Questions Graded', field: 'gradedCount', hide: true },
      { headerName: 'Initial Grade', field: 'initialGrade', hide: true },
      { headerName: 'Grade Adjustment', field: 'gradeAdjustment', hide: true },
      { headerName: 'Initial XP', field: 'initialXp', hide: true },
      { headerName: 'XP Adjustment', field: 'xpAdjustment', hide: true },
      { headerName: 'Current Grade', field: 'currentGrade', hide: true },
      { headerName: 'Max Grade', field: 'maxGrade', hide: true },
      { headerName: 'Current XP (excl. bonus)', field: 'currentXp', hide: true },
      { headerName: 'Max XP', field: 'maxXp', hide: true },
      { headerName: 'Bonus XP', field: 'xpBonus', hide: true }
    ];

    this.state = {
      filterValue: '',
      groupFilterEnabled: false,
      currPage: 1,
      maxPages: 1,
      rowCountString: '(none)',
      isBackDisabled: true,
      isForwardDisabled: true
    };
  }

  public render() {
    const submissionId: number | null = stringParamToInt(this.props.match.params.submissionId);
    // default questionId is 0 (the first question)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || 0;

    /* Create a workspace to grade a submission. */
    if (submissionId !== null) {
      const props: GradingWorkspaceProps = {
        submissionId,
        questionId
      };
      return <GradingWorkspaceContainer {...props} />;
    }

    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Grading"
        description="Fetching submissions..."
        icon={<Spinner size={Spinner.SIZE_LARGE} />}
      />
    );
    const data = this.sortSubmissionsByNotifications();

    const grid = (
      <div className="GradingContainer">
        <div>
          <FormGroup label="Filter:" labelFor="text-input" inline={true}>
            <InputGroup
              id="filterBar"
              large={false}
              leftIcon="filter"
              placeholder="Enter any text (e.g. mission)"
              value={this.state.filterValue}
              onChange={this.handleFilterChange}
              onKeyPress={this.handleFilterKeypress}
              onBlur={this.handleApplyFilter}
            />
          </FormGroup>

          <div className="ag-grid-controls">
            <div className="left-controls">
              <Button
                active={this.state.groupFilterEnabled}
                icon={IconNames.GIT_REPO}
                intent={this.state.groupFilterEnabled ? Intent.PRIMARY : Intent.NONE}
                onClick={this.handleGroupsFilter}
              >
                <div className="ag-grid-button-text hidden-xs">Show all groups</div>
              </Button>
            </div>
            <div className="centre-controls">
              <Button
                icon={IconNames.CHEVRON_BACKWARD}
                onClick={this.changePaginationView('first')}
                minimal={true}
                disabled={this.state.isBackDisabled}
              />
              <Button
                icon={IconNames.CHEVRON_LEFT}
                onClick={this.changePaginationView('prev')}
                minimal={true}
                disabled={this.state.isBackDisabled}
              />
              <Button className="pagination-details hidden-xs" disabled={true} minimal={true}>
                <div>{`Page ${this.state.currPage} of ${this.state.maxPages}`}</div>
                <div>{this.state.rowCountString}</div>
              </Button>
              <Button
                icon={IconNames.CHEVRON_RIGHT}
                onClick={this.changePaginationView('next')}
                minimal={true}
                disabled={this.state.isForwardDisabled}
              />
              <Button
                icon={IconNames.CHEVRON_FORWARD}
                onClick={this.changePaginationView('last')}
                minimal={true}
                disabled={this.state.isForwardDisabled}
              />
            </div>
            <div className="right-controls">
              <Button icon={IconNames.EXPORT} onClick={this.exportCSV}>
                <div className="ag-grid-button-text hidden-xs">Export to CSV</div>
              </Button>
            </div>
          </div>
        </div>

        <Divider />

        <div className="Grading">
          <div className="ag-grid-parent ag-theme-balham">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.columnDefs}
              onGridReady={this.onGridReady}
              onGridSizeChanged={this.resizeGrid}
              onPaginationChanged={this.updatePaginationState}
              rowData={data}
              rowHeight={30}
              pagination={true}
              paginationPageSize={25}
              suppressMovableColumns={true}
              suppressPaginationPanel={true}
            />
          </div>
        </div>
      </div>
    );
    return (
      <div>
        <ContentDisplay
          loadContentDispatch={this.props.handleFetchGradingOverviews}
          display={this.props.gradingOverviews === undefined ? loadingDisplay : grid}
          fullWidth={false}
        />
      </div>
    );
  }

  public componentDidUpdate(prevProps: IGradingProps, prevState: State) {
    // Only update grid data when a notification is acknowledged
    if (this.gridApi && this.props.notifications.length !== prevProps.notifications.length) {
      // Pass the new reconstructed row data to the grid after fetching the updated notifs
      this.gridApi.setRowData(this.sortSubmissionsByNotifications());
    }
  }

  // Forcibly resizes columns to fit the width of the datagrid - prevents datagrid
  // from needing to render a horizontal scrollbar when columns overflow grid width
  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };

  private updatePaginationState = () => {
    if (this.gridApi) {
      const newTotalPages = this.gridApi.paginationGetTotalPages();
      const newCurrPage = newTotalPages === 0 ? 0 : this.gridApi.paginationGetCurrentPage() + 1;
      this.setState({
        currPage: newCurrPage,
        maxPages: newTotalPages,
        rowCountString: this.formatRowCountString(
          25,
          newCurrPage,
          newTotalPages,
          this.gridApi.paginationGetRowCount()
        ),
        isBackDisabled: newTotalPages === 0 || newCurrPage === 1,
        isForwardDisabled: newTotalPages === 0 || newCurrPage === newTotalPages
      });
    }
  };

  private formatRowCountString = (
    pageSize: number,
    currPage: number,
    maxPages: number,
    totalRows: number
  ) => {
    return maxPages === 0
      ? '(none)'
      : currPage !== maxPages
      ? `(#${pageSize * currPage - 24} - #${pageSize * currPage})`
      : `(#${pageSize * currPage - 24} - #${totalRows})`;
  };

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changeVal = event.target.value;
    this.setState({ filterValue: changeVal });
  };

  private handleFilterKeypress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      this.handleApplyFilter();
    }
  };

  private handleApplyFilter = () => {
    if (this.gridApi) {
      this.gridApi.setQuickFilter(this.state.filterValue);
    }
  };

  private handleGroupsFilter = () => {
    if (this.gridApi) {
      this.setState({ groupFilterEnabled: !this.state.groupFilterEnabled });
      this.props.handleFetchGradingOverviews(this.state.groupFilterEnabled);
    }
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.updatePaginationState();
  };

  private exportCSV = () => {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: `SA submissions (${new Date().toISOString()}).csv`,
        // Explicitly declare exported columns to avoid exporting trash columns
        columnKeys: [
          'assessmentName',
          'assessmentCategory',
          'studentName',
          'groupName',
          'submissionStatus',
          'gradingStatus',
          'questionCount',
          'gradedCount',
          'initialGrade',
          'gradeAdjustment',
          'currentGrade',
          'maxGrade',
          'initialXp',
          'xpAdjustment',
          'currentXp',
          'maxXp',
          'xpBonus'
        ]
      });
    }
  };

  private changePaginationView = (type: string) => {
    return () => {
      if (this.gridApi) {
        switch (type) {
          case 'first':
            return this.gridApi.paginationGoToFirstPage();
          case 'prev':
            return this.gridApi.paginationGoToPreviousPage();
          case 'next':
            return this.gridApi.paginationGoToNextPage();
          case 'last':
            return this.gridApi.paginationGoToLastPage();
          default:
        }
      }
    };
  };

  /** Constructs data nodes for the datagrid by joining grading overviews with their
   *  associated notifications.
   *  @return Returns an array of data nodes, prioritising grading overviews with
   *  notifications first.
   */
  private sortSubmissionsByNotifications = () => {
    if (!this.props.gradingOverviews) {
      return [];
    }

    return (this.props.gradingOverviews as GradingOverviewWithNotifications[])
      .map(overview => ({
        ...overview,
        notifications: filterNotificationsBySubmission(overview.submissionId)(
          this.props.notifications
        )
      }))
      .sort((subX, subY) => subY.notifications.length - subX.notifications.length);
  };
}

export default Grading;
