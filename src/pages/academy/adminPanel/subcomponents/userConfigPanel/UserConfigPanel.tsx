import { Button, H2 } from '@blueprintjs/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

import RolesCell from './RolesCell';
import UserActionsCell from './UserActionsCell';

export type UserConfigPanelProps = OwnProps;

type OwnProps = {
  courseRegId?: number;
  userCourseRegistrations?: AdminPanelCourseRegistration[];
  handleUpdateUserRole: (courseRegId: number, role: Role) => void;
  handleDeleteUserFromCourse: (courseRegId: number) => void;
};

/**
 * Only admins can access this panel.
 * - Admins cannot be deleted
 * - An admin cannot downgrade himself to a non-admin role (only
 *   other admins can do so, to prevent a scenario where there are
 *   no admins left in a course)
 */
const UserConfigPanel: React.FC<UserConfigPanelProps> = props => {
  const gridApi = React.useRef<GridApi>();

  const userCourseRegistrations = props.userCourseRegistrations?.map(e =>
    !e.name ? { ...e, name: '(user has yet to log in)' } : e
  );

  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      sort: 'asc'
    },
    {
      headerName: 'Username',
      field: 'username'
    },
    {
      headerName: 'Group',
      field: 'group'
    },
    {
      headerName: 'Role',
      field: 'role',
      cellRendererFramework: RolesCell,
      cellRendererParams: {
        courseRegId: props.courseRegId,
        handleUpdateUserRole: props.handleUpdateUserRole
      },
      width: 110
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRendererFramework: UserActionsCell,
      cellRendererParams: {
        handleDeleteUserFromCourse: props.handleDeleteUserFromCourse
      },
      width: 120,
      filter: false,
      resizable: false
    }
  ];

  const defaultColumnDefs = {
    filter: true,
    resizable: true,
    sortable: true
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
        rowData={userCourseRegistrations}
        rowHeight={36}
        suppressCellSelection={true}
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
