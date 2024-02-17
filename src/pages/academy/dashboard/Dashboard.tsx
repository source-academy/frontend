import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startCase } from 'lodash';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../../commons/ContentDisplay';
import { fetchGroupGradingSummary } from '../../../features/dashboard/DashboardActions';

type DashboardProps = StateProps;

export type StateProps = {};

const defaultColumnDefs: ColDef = {
  filter: true,
  resizable: true,
  sortable: true
};

const Dashboard: React.FC<DashboardProps> = props => {
  const dispatch = useDispatch();
  const gradingSummary = useTypedSelector(state => state.dashboard.gradingSummary);

  let gridApi: GridApi | undefined;

  const onGridReady = (params: GridReadyEvent) => {
    gridApi = params.api;
  };

  const resizeGrid = () => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  };

  const columnDefs = gradingSummary.cols.map(e => {
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
          rowData={gradingSummary.rows}
          rowHeight={30}
          suppressCellFocus={true}
          suppressMovableColumns={true}
        />
      </div>
    </div>
  );

  return (
    <div>
      <ContentDisplay
        display={content}
        loadContentDispatch={() => dispatch(fetchGroupGradingSummary())}
      />
    </div>
  );
};

export default Dashboard;
