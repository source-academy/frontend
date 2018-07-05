import { NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'

import GradingWorkspaceContainer from '../../../containers/academy/grading/GradingWorkspaceContainer'
import { stringParamToInt } from '../../../utils/paramParseHelpers'
import { controlButton } from '../../commons'
import ContentDisplay from '../../commons/ContentDisplay'
import GradingNavLink from './GradingNavLink'
import { GradingOverview } from './gradingShape'
import { OwnProps as GradingWorkspaceProps } from './GradingWorkspace'

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[]
}

interface IGradingProps
  extends IDispatchProps,
    IStateProps,
    RouteComponentProps<IGradingWorkspaceParams> {}

export interface IGradingWorkspaceParams {
  submissionId?: string
  questionId?: string
}

export interface IDispatchProps {
  handleFetchGradingOverviews: () => void
  handleUpdateCurrentSubmissionId: (submissionId: number, questionId: number) => void
  handleResetAssessmentWorkspace: () => void
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[]
  storedSubmissionId?: number
  storedQuestionId?: number
}

class Grading extends React.Component<IGradingProps, State> {
  private gridApi?: GridApi
  private columnApi?: ColumnApi

  public constructor(props: IGradingProps) {
    super(props)

    this.state = {
      columnDefs: [
        { headerName: 'Submission ID', field: 'submissionId' },
        { headerName: 'Assessment ID', field: 'assessmentId' },
        { headerName: 'Assessment Name', field: 'assessmentName' },
        { headerName: 'Assessment Category', field: 'assessmentCategory' },
        { headerName: 'Student ID', field: 'studentId' },
        { headerName: 'Student Name', field: 'studentName' },
        { headerName: 'Current XP', field: 'currentXP' },
        { headerName: 'Maximum XP', field: 'maximumXP' },
        {
          headerName: 'Graded',
          field: 'graded',
          cellRendererFramework: GradingNavLink,
        }
      ]
    }
  }

  /**
   * If the current SubmissionId/QuestionId has changed, update it
   * in the store and reset the workspace.
   */
  public componentWillMount() {
    const submissionId = stringParamToInt(this.props.match.params.submissionId)
    if (submissionId === null) {
      return
    }
    const questionId = stringParamToInt(this.props.match.params.questionId)!

    if (
      this.props.storedSubmissionId !== submissionId ||
      this.props.storedQuestionId !== questionId
    ) {
      this.props.handleUpdateCurrentSubmissionId(submissionId, questionId)
      this.props.handleResetAssessmentWorkspace()
    }
  }

  public render() {
    const submissionId: number | null = stringParamToInt(this.props.match.params.submissionId)
    // default questionId is 0 (the first question)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || 0

    /* Create a workspace to grade a submission. */
    if (submissionId !== null) {
      const props: GradingWorkspaceProps = {
        submissionId,
        questionId
      }
      return <GradingWorkspaceContainer {...props} />
    }

    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Grading"
        description="Fetching submissions..."
        visual={<Spinner large={true} />}
      />
    )
    const grid = (
      <div className="Grading">
        <div className="ag-grid-parent ag-theme-balham">
          <AgGridReact
            gridAutoHeight={true}
            enableColResize={true}
            enableSorting={true}
            enableFilter={true}
            columnDefs={this.state.columnDefs}
            onGridReady={this.onGridReady}
            rowData={this.props.gradingOverviews}
          />
        </div>
        <div className="ag-grid-export-button">
          {controlButton('Export to CSV', IconNames.EXPORT, this.exportCSV)}
        </div>
      </div>
    )
    return (
      <ContentDisplay
        loadContentDispatch={this.props.handleFetchGradingOverviews}
        display={this.props.gradingOverviews === undefined ? loadingDisplay : grid}
        fullWidth={true}
      />
    )
  }

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api
    this.columnApi = params.columnApi
    this.columnApi.autoSizeAllColumns()
  }

  private exportCSV = () => {
    if (this.gridApi === undefined) {
      return
    }
    this.gridApi.exportDataAsCsv()
  }
}

export default Grading
