import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startCase } from 'lodash-es';
import { themeSource } from 'src/commons/agGrid/theme';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../../commons/ContentDisplay';
import { fetchGroupGradingSummary } from '../../../features/dashboard/DashboardActions';

const defaultColumnDefs: ColDef = {
  flex: 1,
  filter: true,
  resizable: true,
  sortable: true,
};

function Dashboard() {
  const dispatch = useAppDispatch();
  const gradingSummary = useAppSelector(state => state.dashboard.gradingSummary);

  const columnDefs = gradingSummary.cols.map(e => {
    return {
      headerName: startCase(e),
      field: e,
    };
  });

  const content = (
    <div className="Dashboard">
      <div className="Grid">
        <AgGridReact
          theme={themeSource}
          domLayout="autoHeight"
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
          rowData={gradingSummary.rows}
          rowHeight={30}
          suppressCellFocus
          suppressMovableColumns
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
}

export const Component = Dashboard;
