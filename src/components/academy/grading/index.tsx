import {
  Button,
  Colors,
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
import { sortBy } from 'lodash';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import GradingWorkspaceContainer from '../../../containers/academy/grading/GradingWorkspaceContainer';
import { stringParamToInt } from '../../../utils/paramParseHelpers';
import ContentDisplay from '../../commons/ContentDisplay';
import GradingHistory from './GradingHistory';
import GradingNavLink from './GradingNavLink';
import { GradingOverview } from './gradingShape';
import { OwnProps as GradingWorkspaceProps } from './GradingWorkspace';
import UnsubmitCell from './UnsubmitCell';

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  filterValue: string;
  groupFilterEnabled: boolean;
};

type GradingNavLinkProps = {
  data: GradingOverview;
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
  handleFetchGradingOverviews: (filterToGroup?: boolean) => void;
  handleUnsubmitSubmission: (submissionId: number) => void;
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[];
}

/** Component to render in table - grading status */
const GradingStatus = (props: GradingNavLinkProps) => {
  return <GradingHistory data={props.data} exp={false} grade={false} status={true} />;
};

/** Component to render in table - marks */
const GradingMarks = (props: GradingNavLinkProps) => {
  return <GradingHistory data={props.data} exp={false} grade={true} status={false} />;
};

/** Component to render in table - XP */
const GradingExp = (props: GradingNavLinkProps) => {
  return <GradingHistory data={props.data} exp={true} grade={false} status={false} />;
};

class Grading extends React.Component<IGradingProps, State> {
  private columnDefs: ColDef[];
  private gridApi?: GridApi;

  public constructor(props: IGradingProps) {
    super(props);

    this.columnDefs = [
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
        cellRendererFramework: GradingNavLink,
        width: 65,
        suppressFilter: true,
        suppressSorting: true,
        suppressSizeToFit: true,
        suppressResize: true
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
      { headerName: 'Current XP', field: 'currentXp', hide: true },
      { headerName: 'Max XP', field: 'maxXp', hide: true },
      { headerName: 'Bonus XP', field: 'xpBonus', hide: true }
    ];

    this.state = {
      filterValue: '',
      groupFilterEnabled: false
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
        visual={<Spinner large={true} />}
      />
    );
    const data = sortBy(this.props.gradingOverviews, [
      (a: GradingOverview) => -a.assessmentId,
      (a: GradingOverview) => -a.submissionId
    ]);

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
            <div className="right-controls">
              <Button icon={IconNames.EXPORT} onClick={this.exportCSV}>
                <div className="ag-grid-button-text hidden-xs">Export to CSV</div>
              </Button>
            </div>
          </div>
        </div>

        <hr />

        <div className="Grading">
          <div className="ag-grid-parent ag-theme-balham">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.columnDefs}
              onGridReady={this.onGridReady}
              rowData={data}
              pagination={true}
              paginationPageSize={50}
              suppressMovableColumns={true}
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

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changeVal = event.target.value;
    this.setState({ filterValue: changeVal });

    if (this.gridApi) {
      this.gridApi.setQuickFilter(changeVal);
    }
  };

  private handleGroupsFilter = () => {
    this.setState({ groupFilterEnabled: !this.state.groupFilterEnabled });
    this.props.handleFetchGradingOverviews(this.state.groupFilterEnabled);
  };

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    window.onresize = () => this.gridApi!.sizeColumnsToFit();
  };

  private exportCSV = () => {
    if (this.gridApi === undefined) {
      return;
    }
    this.gridApi.exportDataAsCsv({ allColumns: true });
  };
}

export default Grading;
