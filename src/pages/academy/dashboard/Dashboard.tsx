import { type ColDef, themeBalham } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startCase } from 'lodash';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import ContentDisplay from '../../../commons/ContentDisplay';
import { fetchGroupGradingSummary } from '../../../features/dashboard/DashboardActions';

const defaultColumnDefs: ColDef = {
  flex: 1,
  filter: true,
  resizable: true,
  sortable: true
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const gradingSummary = useTypedSelector(state => state.dashboard.gradingSummary);

  const columnDefs = gradingSummary.cols.map(e => {
    return {
      headerName: startCase(e),
      field: e
    };
  });

  const content = (
    <div className="Dashboard">
      <div className="Grid">
        <AgGridReact
          theme={themeBalham}
          domLayout="autoHeight"
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDefs}
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

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Dashboard;
Component.displayName = 'Dashboard';

export default Dashboard;
