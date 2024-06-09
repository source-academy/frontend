import { Button, H2 } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

import RolesCell from './RolesCell';
import UserActionsCell from './UserActionsCell';

type Props = {
  courseRegId?: number;
  userCourseRegistrations?: AdminPanelCourseRegistration[];
  handleUpdateUserRole: (courseRegId: number, role: Role) => void;
  handleDeleteUserFromCourse: (courseRegId: number) => void;
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
const UserConfigPanel: React.FC<Props> = props => {
  const gridApi = React.useRef<GridApi>();

  const userCourseRegistrations = props.userCourseRegistrations?.map(e =>
    !e.name ? { ...e, name: '(user has yet to log in)' } : e
  );

  const columnDefs: ColDef<AdminPanelCourseRegistration>[] = [
    { headerName: 'Name', field: 'name', sort: 'asc' },
    { headerName: 'Username', field: 'username' },
    { headerName: 'Group', field: 'group' },
    {
      headerName: 'Role',
      field: 'role',
      cellRenderer: RolesCell,
      cellRendererParams: {
        courseRegId: props.courseRegId,
        handleUpdateUserRole: props.handleUpdateUserRole
      }
    },
    {
      headerName: 'Actions',
      field: 'actions' as any,
      cellRenderer: UserActionsCell,
      cellRendererParams: {
        handleDeleteUserFromCourse: props.handleDeleteUserFromCourse
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
        rowData={userCourseRegistrations}
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
        <H2>Users</H2>
        <Button
          text="Export as CSV"
          className="export-csv-button"
          onClick={() => {
            if (gridApi.current) {
              gridApi.current.exportDataAsCsv({
                fileName: `SA Users (${new Date().toISOString()}).csv`,
                columnKeys: ['name', 'username', 'group', 'role']
              });
            }
          }}
        />
      </div>
      {grid}
    </div>
  );
};

export default UserConfigPanel;
