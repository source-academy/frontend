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
  timeOptions.sort((to1, to2) => to1.minutes - to2.minutes);

  const getUserFriendlyText = (option: TimeOption) =>
    option.minutes >= 60
      ? `${Math.round((option.minutes / 60) * 100) / 100} hour(s)`
      : `${option.minutes} minute(s)`;

  const renderOption: ItemRenderer<TimeOption> = (
    option: TimeOption,
    { handleClick, handleFocus, modifiers, query }
  ) => {
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={option.id + '' + option.minutes}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={getUserFriendlyText(option)}
      />
    );
  };

  const defaultTimeOptions = timeOptions.filter(to => to.isDefault);
  if (defaultTimeOptions.length === 1) {
    if (!selectedOption || selectedOption.id !== defaultTimeOptions[0].id) {
      setSelectedOption(defaultTimeOptions[0]);
    }
  }

  const handleSelect = (option: TimeOption) => {
    setSelectedOption(option);
    const updatedTimeOptions: TimeOption[] = timeOptions.map(timeOption => {
      return {
        ...timeOption,
        isDefault: timeOption.id === option.id && timeOption.minutes === option.minutes
      };
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
        text={selectedOption ? getUserFriendlyText(selectedOption) : 'Choose default'}
        rightIcon="caret-down"
      />
    </Select2>
  );
};

export default SelectCell;
