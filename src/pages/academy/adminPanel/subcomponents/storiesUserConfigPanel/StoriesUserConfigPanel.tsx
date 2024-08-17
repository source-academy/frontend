import { Button, H2 } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { AdminPanelStoriesUser } from 'src/features/stories/StoriesTypes';

import RolesCell from './RolesCell';
import StoriesUserActionsCell from './StoriesUserActionsCell';

type Props = {
  userId?: number;
  storiesUsers?: AdminPanelStoriesUser[];
  handleUpdateStoriesUserRole: (id: number, role: StoriesRole) => void;
  handleDeleteStoriesUserFromUserGroup: (id: number) => void;
};

const defaultColumnDefs: ColDef = {
  flex: 1,
  filter: true,
  resizable: true,
  sortable: true
};

/**
 * Only admins can access this panel.
 * - Admins cannot be deleted
 * - An admin cannot downgrade himself to a non-admin role (only
 *   other admins can do so, to prevent a scenario where there are
 *   no admins left in a course)
 */
const StoriesUserConfigPanel: React.FC<Props> = props => {
  const gridApi = React.useRef<GridApi>();

  const storiesUsers = props.storiesUsers?.map(e =>
    !e.name ? { ...e, name: '(user has yet to log in)' } : e
  );

  const columnDefs: ColDef<AdminPanelStoriesUser>[] = [
    { headerName: 'Name', field: 'name', sort: 'asc' },
    { headerName: 'Username', field: 'username' },
    {
      headerName: 'Role',
      field: 'role',
      cellRenderer: RolesCell,
      cellRendererParams: {
        id: props.userId,
        handleUpdateStoriesUserRole: props.handleUpdateStoriesUserRole
      }
    },
    {
      headerName: 'Actions',
      field: 'actions' as any,
      cellRenderer: StoriesUserActionsCell,
      cellRendererParams: {
        handleDeleteStoriesUserFromUserGroup: props.handleDeleteStoriesUserFromUserGroup
      },
      filter: false,
      resizable: false
    }
  ];

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout="autoHeight"
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        rowData={storiesUsers}
        rowHeight={36}
        suppressCellFocus={true}
        suppressMovableColumns={true}
        pagination
      />
    </div>
  );

  return (
    <div className="users-configuration">
      <div className="users-header-container">
        <H2>Stories Users</H2>
        <Button
          text="Export as CSV"
          className="export-csv-button"
          onClick={() => {
            if (gridApi.current) {
              gridApi.current.exportDataAsCsv({
                fileName: `SA Stories Users (${new Date().toISOString()}).csv`,
                columnKeys: ['name', 'username', 'role']
              });
            }
          }}
        />
      </div>
      {grid}
    </div>
  );
};

export default StoriesUserConfigPanel;
