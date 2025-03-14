// import { Switch } from '@blueprintjs/core';
// import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@tremor/react';
// import { SessionUser } from '../SideContentTypes';
// import SideContentRoleSelector from './SideContentRoleSelector';
import { Classes, HTMLTable, Switch } from '@blueprintjs/core';
import { CollabEditingAccess, SharedbAceUser } from '@sourceacademy/sharedb-ace/distribution/types';
import React, { useState } from 'react';

type Props = {
  users: Record<string, SharedbAceUser>;
};

const SideContentSessionManagement: React.FC<Props> = ({ users }) => {
  const [toggling, _setToggling] = useState<{ [key: string]: boolean }>({});

  // TODO: KX WIP
  // const handleToggleAccess = async (id: string) => {
  //   if (toggling[id]) return;

  //   setToggling(prev => ({ ...prev, [id]: true }));

  //   const newLevels = usersAccessLevel.map(user =>
  //     user.id === id
  //       ? {
  //           ...user,
  //           role:
  //             user.role === CollabEditingAccess.EDITOR
  //               ? CollabEditingAccess.VIEWER
  //               : CollabEditingAccess.EDITOR
  //         }
  //       : user
  //   );
  //   setUsersAccessLevel(newLevels);

  //   try {
  //     await updateBinding(
  //       id,
  //       newLevels.find(user => user.id === id)?.role || CollabEditingAccess.VIEWER
  //     );
  //   } finally {
  //     setToggling(prev => ({ ...prev, [id]: false }));
  //   }
  // };

  const myself = Object.values(users)[0];

  // TODO: Split return type into admin view and normal view, based on myself
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
            <td />
            <td />
          </tr>
          {Object.values(users).map((user, index) => {
            return (
              <tr key={user.color}>
                <td
                  style={{
                    verticalAlign: 'middle',
                    display: 'flex',
                    gap: '1em',
                    alignItems: 'center'
                  }}
                  className={Classes.INTERACTIVE}
                >
                  <div
                    style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#ced9e0' : user.color
                    }}
                  />
                  <div>{user.name}</div>
                </td>
                <td style={{ textAlign: 'end' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                  >
                    {myself.role === CollabEditingAccess.OWNER && (
                      <Switch
                        labelElement={
                          user.role === CollabEditingAccess.OWNER
                            ? 'Admin'
                            : user.role.toUpperCase()
                        }
                        disabled={
                          myself.role !== CollabEditingAccess.OWNER ||
                          toggling[user.name] ||
                          user.role === CollabEditingAccess.OWNER
                        }
                        alignIndicator="right"
                        checked={
                          user.role === CollabEditingAccess.EDITOR ||
                          user.role === CollabEditingAccess.OWNER
                        }
                        // onChange={() => handleToggleAccess(user.name)}
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

// async function updateBinding(id: string, newRole: string) {
//   return new Promise(resolve => setTimeout(resolve, 500));
// }
