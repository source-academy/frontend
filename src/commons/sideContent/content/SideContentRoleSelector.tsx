// import { Switch } from '@blueprintjs/core';
import { Button, ButtonGroup } from '@blueprintjs/core';
import React, { useState } from 'react';

type Props = {
  userId: any;
  role: integer;
};

const SideContentRoleSelector: React.FC<Props> = ({ userId, role }) => {
  const [selected, setSelected] = useState(role);
  return (
    <ButtonGroup key={userId + '-role'}>
      <Button
        key={1}
        text="Editor"
        intent={selected > 0 ? 'primary' : 'none'}
        onClick={e => setSelected(1)}
      />
      <Button
        key={0}
        text="Viewer"
        intent={selected < 1 ? 'primary' : 'none'}
        onClick={e => setSelected(0)}
      />
    </ButtonGroup>
  );
};

export default SideContentRoleSelector;
