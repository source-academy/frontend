import { NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'

import { GradingOverview } from '../../../reducers/states'
import { stringParamToInt } from '../../../utils/paramParseHelpers'
import { controlButton } from '../../commons'
import ContentDisplay from '../../commons/ContentDisplay'

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[]
}

interface IGradingProps extends IDispatchProps, IStateProps, RouteComponentProps<IGradingWorkspaceParams> {}

export interface IGradingWorkspaceParams {
  submissionId?: string,
  questionId?: string
}

export interface IDispatchProps {
  handleFetchGradingOverviews: () => void
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[]
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
          cellRenderer: ({ data }: { data: GradingOverview }) => {
            return `<a href='${window.location.origin}/academy/grading/${data.submissionId}'>${
              data.graded ? 'Done' : 'Not Graded'
            }</a>`
          }
        }
      ]
    }
  }
  
  public render() {
    const submissionId: number | null = stringParamToInt(this.props.match.params.submissionId)
    // default questionId is 0 (the first question)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || 0

    // TODO flip the logic, make the display then pass to contentdisp
    if (submissionId !== null) {
      const props: GradingWorkspaceProps = {
        submissionId,
        questionId
      }
      return <GradingWorkspaceContainer {...props} />
    }

    /** 
     * Try to render Grading Listing since 
     * no URL parameters were found 
     */
    if (this.props.gradingOverviews === undefined) {
      const loadingDisplay = (
        <NonIdealState
          className="Grading"
          description="Fetching submissions..."
          visual={<Spinner large={true} />}
        />
      )
      return (
        <ContentDisplay
          loadContentDispatch={this.props.handleFetchGradingOverviews}
          display={loadingDisplay}
        />
      )
    }
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
        display={grid}
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
