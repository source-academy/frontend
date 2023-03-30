import { TagInput } from '@blueprintjs/core';
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
};

function isValidTimeOption(n: string) {
  const num = parseFloat(n);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

const TimeOptionCell: React.FC<TimeOptionCellProps> = props => {
  const timeOptions: TimeOption[] = props.data[props.field];
  const [values, setValues] = useState<React.ReactNode[]>(
    timeOptions.map((timeOption: TimeOption) => (timeOption.minutes / 60).toFixed(2).toString())
  );

  const onRemove = (value: React.ReactNode, index: number) => {
    console.log(value);
    console.log(index);
    console.log(timeOptions[index]);
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
        isDefault: false
      };

      setValues([...values, value]);
      console.log(values);
      console.log(newTimeOption);
      props.setStateHandler(props.rowIndex, [...timeOptions, newTimeOption]);
    }
  };

  return <TagInput values={values} onRemove={onRemove} onAdd={onAdd} />;
};

export default TimeOptionCell;
