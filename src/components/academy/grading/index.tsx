import { ColDef } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
import * as React from 'react'

type State = {
  columnDefs: ColDef[]
  rowData: any[]
}

class App extends React.Component<{}, State> {
  public constructor(props: any) {
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

export default App;
