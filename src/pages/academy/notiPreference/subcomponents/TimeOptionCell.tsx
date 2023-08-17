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
//首先看如何拿到你外层你数据是长度2对吧，长度2的数组里有一个id标识符，传进来或者看组件有没有地方可以拿到
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
    //  首先第一步是这里触发，您添加或者删除单元格里的标签都会触发这两个方法
    setValues(values.filter(i => i !== value));
    props.setDelete(timeOptions[index]);
    props.setStateHandler(
      props.rowIndex,
      timeOptions.filter((_, i) => i !== index)
    );
  };

  const onAdd = (value: React.ReactNode) => {
    //  首先第一步是这里触发，您添加或者删除单元格里的标签都会触发这两个方法
    if (isValidTimeOption(value as string)) {
      const newTimeOption: TimeOption = {
        id: -1,
        minutes: parseFloat(value as string) * 60,
        isDefault: false
      };

      setValues([...values, ...value as string[]]);
      //然后到这里您把处理好了的最新值丢给了外层的处理函数
      //然后这里传出去做标识符的时候 就不要用rowIndex， 用那个id
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
