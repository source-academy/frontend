import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startCase } from 'lodash';
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

const defaultColumnDefs: ColDef = {
  filter: true,
  resizable: true,
  sortable: true
};

const Dashboard: React.FC<DashboardProps> = props => {
  let gridApi: GridApi | undefined;

  const onGridReady = (params: GridReadyEvent) => {
    gridApi = params.api;
  };

  const resizeGrid = () => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  };

  const columnDefs = props.gradingSummary.cols.map(e => {
    return {
      headerName: startCase(e),
      field: e
    };
  });

  const content = (
    <div className="Dashboard">
      <div className="Grid ag-grid-parent ag-theme-balham">
        <AgGridReact
          domLayout={'autoHeight'}
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
          onGridReady={onGridReady}
          onGridSizeChanged={resizeGrid}
          rowData={props.gradingSummary.rows}
          rowHeight={30}
          suppressCellSelection={true}
          suppressMovableColumns={true}
        />
      </div>
    </div>
  );

  return (
    <div>
      <ContentDisplay display={content} loadContentDispatch={props.handleFetchGradingSummary} />
    </div>
  );
};

export default Dashboard;
