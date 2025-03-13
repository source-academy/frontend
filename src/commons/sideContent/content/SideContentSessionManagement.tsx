// import { Switch } from '@blueprintjs/core';
// import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
// import { SessionUser } from '../SideContentTypes';
// import SideContentRoleSelector from './SideContentRoleSelector';
import { Classes, HTMLTable, Switch } from '@blueprintjs/core';
import type { SharedbAceUser } from '@sourceacademy/sharedb-ace/distribution/types';
import React, { useMemo, useState } from 'react';

type Props = {
  usersArray: SharedbAceUser[];
  canManage: boolean;
};

const SideContentSessionManagement: React.FC<Props> = ({ usersArray, canManage = true }) => {

  const [usersAccessLevel, setUsersAccessLevel] = useState<{ id: string; role: string }[]>([]);
  const [toggling, setToggling] = useState<{ [key: string]: boolean }>({});

  const handleToggleAccess = async (id: string) => {
    if (toggling[id]) return;
    
    setToggling(prev => ({ ...prev, [id]: true }));
    
    const newLevels = usersAccessLevel.map(user =>
      user.id === id ? { ...user, role: user.role === 'editor' ? 'viewer' : 'editor' } : user
    );
    setUsersAccessLevel(newLevels);
    
    try {
      await updateBinding(id, newLevels.find(user => user.id === id)?.role || 'viewer');
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  useMemo(() => {
    const usersLevels = usersArray.map(user => ({
      id: user.color,
      role : user.role
    }));
    setUsersAccessLevel(usersLevels);
  }, [usersArray]);

  return (
    <div
      style={{
        marginInline: '0.5em'
      }}
    >
      <HTMLTable
        className="w-full"
        compact
        style={{
          width: 'calc(100% - 1em)',
          paddingInline: '0.5em',
          borderSpacing: '0 0.5em'
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th style={{ textAlign: 'end' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
          </tr>
          {usersArray.map((user, index) => {
            const userRole = usersAccessLevel.find(u => u.id === user.color)?.role || 'viewer';
            return (
              <tr key={user.color}>
                <td
                  style={{ verticalAlign: 'middle', display: 'flex', gap: '1em', alignItems: 'center' }}
                  className={Classes.INTERACTIVE}
                >
                  <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: index === 0 ? '#ced9e0' : user.color }} />
                  <div>{user.name}</div>
                </td>
                <td style={{ textAlign: 'end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {usersArray[0].role === 'owner' && (
                    <Switch
                      labelElement={userRole === 'owner' ? 'Admin' : userRole === 'editor' ? 'Editor' : 'Viewer'}
                      disabled={usersArray[0].role !== 'owner' || toggling[user.name] || userRole === 'owner'}
                      alignIndicator="right"
                      checked={userRole === 'editor' || userRole === 'owner'}
                      onChange={() => handleToggleAccess(user.name)}
                    />
                  )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </HTMLTable>
    </div>
  );
};

export default SideContentSessionManagement;

async function updateBinding(id: string, newRole: string) {
  return new Promise(resolve => setTimeout(resolve, 500));
}

