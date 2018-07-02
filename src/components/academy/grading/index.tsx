import { ColDef } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css'; import 'ag-grid/dist/styles/ag-theme-balham.css';
import * as React from 'react'

import { GradingInfo } from '../../../reducers/states'

type State = {
  columnDefs: ColDef[]
  rowData: any[]
}

type GradingProps = DispatchProps & StateProps

export type DispatchProps = {
  handleFetchStudents: () => void
}

export type StateProps = {
  gradings: GradingInfo[]
}

class Grading extends React.Component<GradingProps, State> {
  public constructor(props: GradingProps) {
    super(props);

    this.state = {
      columnDefs: [
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"},
        {headerName: "Price", field: "price"}

      ],
      rowData: [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
      ]
    }
  }

  public componentWillMount() {

  }

  public render() {
    return (
      <div 
      className="ag-theme-balham"
      style={{ 
        height: '500px', 
          width: '600px' }} 
      >
      <AgGridReact
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData} />
      </div>
    );
  }
}

export default Grading;
