import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import React from 'react';

const DataTable: React.FC<AgGridReactProps> = props => {
  return (
    <div className="ag-grid-parent ag-theme-balham">
      <AgGridReact {...props} />
    </div>
  );
};

export default DataTable;
