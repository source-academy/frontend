// import { Switch } from '@blueprintjs/core';
// import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
// import { SessionUser } from '../SideContentTypes';
// import SideContentRoleSelector from './SideContentRoleSelector';
import { Classes, HTMLTable, Switch } from '@blueprintjs/core';
import { CollabEditingAccess, SharedbAceUser } from '@sourceacademy/sharedb-ace/distribution/types';
import React, { useState } from 'react';

interface AdminViewProps {
  users: Record<string, SharedbAceUser>;
}

function AdminView({ users }: AdminViewProps) {
  const [toggling, setToggling] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(Object.entries(users).map(([id]) => [id, true]))
  );

  const handleToggleAccess = async (checked: boolean, id: string) => {
    if (toggling[id]) return;

    setToggling(prev => ({ ...prev, [id]: true }));

    try {
      await updateBinding(id, checked ? CollabEditingAccess.EDITOR : CollabEditingAccess.VIEWER);
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <HTMLTable compact>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(users).map((user, index) => (
          <tr key={user.color}>
            <td className={Classes.INTERACTIVE}>
              <div style={{ backgroundColor: index === 0 ? '#ced9e0' : user.color }} />
              <div>{user.name}</div>
            </td>
            <td>
              <Switch
                labelElement={
                  user.role === CollabEditingAccess.OWNER
                    ? 'Admin'
                    : user.role.charAt(0).toUpperCase() + user.role.slice(1)
                }
                alignIndicator="right"
                checked={
                  user.role === CollabEditingAccess.OWNER ||
                  user.role === CollabEditingAccess.EDITOR
                }
                disabled={user.role === CollabEditingAccess.OWNER}
                onChange={event => handleToggleAccess(event.target.checked, user.name)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
}

type Props = {
  users: Record<string, SharedbAceUser>;
};

const SideContentSessionManagement: React.FC<Props> = ({ users }) => {
  if (Object.values(users).length === 0) return;
  const myself = Object.values(users)[0];

  return (
    <div className="session-management-table">
      {myself.role === CollabEditingAccess.OWNER ? (
        <AdminView users={users} />
      ) : (
        <HTMLTable compact>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(users).map((user, index) => {
            return (
              <tr key={user.color}>
                  <td className={Classes.INTERACTIVE}>
                    <div style={{ backgroundColor: index === 0 ? '#ced9e0' : user.color }} />
                  <div>{user.name}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </HTMLTable>
      )}
    </div>
  );
};

export default SideContentSessionManagement;

async function updateBinding(id: string, newRole: string) {
  // TODO: Update to real binding function
  return new Promise(resolve => setTimeout(resolve, 500));
}
