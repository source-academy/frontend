import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select2 } from '@blueprintjs/select';
import React from 'react';
import { NotificationConfiguration, TimeOption } from 'src/commons/application/types/SessionTypes';
import { KeysOfType } from 'src/commons/utils/TypeHelper';

type SelectCellProps = OwnProps;

type OwnProps = {
  data: NotificationConfiguration;
  rowIndex: number;
  field: KeysOfType<NotificationConfiguration, TimeOption[]>;
  setStateHandler: (rowIndex: number, value: any) => void;
};

const SelectCell: React.FC<SelectCellProps> = props => {
  const [selectedOption, setSelectedOption] = React.useState<TimeOption>();
  const timeOptions: TimeOption[] = props.data[props.field];
  const renderOption: ItemRenderer<TimeOption> = (
    option: TimeOption,
    { handleClick, handleFocus, modifiers, query }
  ) => {
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={option.id}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={`${option.minutes / 60}`}
      />
    );
  };

  const handleSelect = (option: TimeOption) => {
    setSelectedOption(option);
    const updatedTimeOptions: TimeOption[] = timeOptions.map(timeOption => {
      return { ...timeOption, default: timeOption.id === option.id };
    });
    props.setStateHandler(props.rowIndex, updatedTimeOptions);
  };
  return (
    <Select2<TimeOption>
      filterable={false}
      items={timeOptions}
      itemRenderer={renderOption}
      onItemSelect={handleSelect}
      noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
    >
      <Button
        text={selectedOption?.minutes || 'NA'}
        rightIcon="caret-down"
        placeholder="Choose default"
      />
    </Select2>
  );
};

export default SelectCell;
