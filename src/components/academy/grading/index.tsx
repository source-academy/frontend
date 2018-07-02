import { NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ColDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
import * as React from 'react'

import { GradingOverview } from '../../../reducers/states'
import { controlButton } from '../../commons'
import ContentDisplay from '../../commons/ContentDisplay'

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[]
}

type GradingProps = DispatchProps & StateProps

export type DispatchProps = {
  handleFetchGradingOverviews: () => void
}

export type StateProps = {
  gradingOverviews?: GradingOverview[]
}

class Grading extends React.Component<GradingProps, State> {
  private gridApi?: GridApi
  private columnApi?: ColumnApi

  public constructor(props: GradingProps) {
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
    if (this.props.gradingOverviews === undefined) {
      const loadingDisplay = (
        <NonIdealState
          className="GradingListing"
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
      <div className="GradingListing">
        <div className="ag-grid-parent ag-theme-balham">
          <AgGridReact
            gridAutoHeight={true}
            enableColResize={true}
            suppressExcelExport={false}
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
