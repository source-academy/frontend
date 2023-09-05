import { TagInput } from '@blueprintjs/core';
import { isInteger } from 'lodash';
import React, { useState } from 'react';
import { NotificationConfiguration, TimeOption } from 'src/commons/application/types/SessionTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type TimeOptionCellProps = OwnProps;

type OwnProps = {
  data: NotificationConfiguration;
  rowIndex: number;
  field: KeysOfType<NotificationConfiguration, TimeOption[]>;
  setStateHandler: (rowIndex: number, value: TimeOption[]) => void;
  setDelete: (timeOption: TimeOption) => void;
  typeId: string;
};

const TimeOptionCell: React.FC<TimeOptionCellProps> = props => {
  const timeOptions: TimeOption[] = props.data[props.field];
  const [values, setValues] = useState<React.ReactNode[]>(
    timeOptions.map((timeOption: TimeOption) => (timeOption.minutes / 60).toFixed(2).toString())
  );

  function isValidTimeOption(n: string) {
    const num = parseFloat(n);
    const minutes = num * 60;
    if (!isInteger(minutes)) return false;
    // Check if time option already exists
    if (timeOptions.some((timeOption: TimeOption) => timeOption.minutes === minutes)) return false;

    return !isNaN(num) && isFinite(num) && num >= 0;
  }

  const onRemove = (value: React.ReactNode, index: number) => {
    // TODO: Show Warning Dialog
    setValues(values.filter(i => i !== value));
    props.setDelete(timeOptions[index]);
    props.setStateHandler(
      props.rowIndex,
      timeOptions.filter((_, i) => i !== index)
    );
  };

  const onAdd = (value: React.ReactNode) => {
    if (isValidTimeOption(value as string)) {
      const newTimeOption: TimeOption = {
        id: -1,
        minutes: parseFloat(value as string) * 60,
        isDefault: true
      };

      setValues([...values, value]);
      console.log(props.rowIndex, value, values);
      props.setStateHandler(props.rowIndex, [...timeOptions, newTimeOption]);
    } else {
      // TODO: Toaster if posisble
    }
  };

  return <TagInput values={values} onRemove={onRemove} onAdd={onAdd} />;
  /*

  if (props.typeId === '1' || props.typeId === '2') {
    return <TagInput values={values} onRemove={onRemove} onAdd={onAdd} />;
  } else {
    return <span>NA</span>;
  }
  */
};
export default TimeOptionCell;
