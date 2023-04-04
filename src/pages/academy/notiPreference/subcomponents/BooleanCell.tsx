import { Switch } from '@blueprintjs/core';
import React from 'react';
import { NotificationConfiguration } from 'src/commons/application/types/SessionTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type BooleanCellProps = OwnProps;

type OwnProps = {
  data: NotificationConfiguration;
  field: KeysOfType<NotificationConfiguration, boolean>;
  rowIndex: number;
  setStateHandler: (index: number, value: boolean) => void;
};

const BooleanCell: React.FC<BooleanCellProps> = props => {
  const { data } = props;
  let checked = data[props.field];

  if (
    props.data.notificationPreference !== null &&
    props.data.notificationPreference.isEnabled !== null
  ) {
    checked = props.data.notificationPreference.isEnabled;
  }

  const changeHandler = React.useCallback(() => {
    props.setStateHandler(props.rowIndex, !checked);
  }, [props, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
};

export default BooleanCell;
