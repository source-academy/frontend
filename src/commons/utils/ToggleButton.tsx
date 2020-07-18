import { Button } from '@blueprintjs/core';
import React from 'react';

const ToggleButton = React.memo(({ value, toggleEffect, toggleIcons }: any) => {
  const [added, setAdded] = React.useState(false);

  const toggle = () => {
    toggleEffect(value, added);
    setAdded(a => !a);
  };

  return (
    <div>
      <Button icon={added ? toggleIcons[0] : toggleIcons[1]} onClick={toggle}>
        {value}
      </Button>
    </div>
  );
});

export default ToggleButton;
