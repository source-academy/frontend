import { Intent, Tag } from '@blueprintjs/core';
import * as React from 'react';

type OwnProps = {
  large?: boolean;
  number: number;
};

const NotificationBadge: React.SFC<OwnProps> = props => (
  <Tag intent={Intent.DANGER} round={true} large={props.large}>
    {props.number}
  </Tag>
);

export default NotificationBadge;
