import React from 'react';

import { Card } from '@blueprintjs/core';

type SubachievementCardProps = {
  subachievement: any;
  displayModal: any;
};

function SubachievementCard(props: SubachievementCardProps) {
  const { subachievement, displayModal } = props;
  const [{ title }] = subachievement;

  return (
    <Card className="subachievement" onClick={displayModal(title)}>
      <h3>{title}</h3>
    </Card>
  );
}

export default SubachievementCard;
