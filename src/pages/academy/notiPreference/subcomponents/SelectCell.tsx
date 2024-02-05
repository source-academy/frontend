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
  setStateHandler: (rowIndex: number, value: TimeOption) => void;
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
        key={option.id}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={getUserFriendlyText(option)}
      />
    );
  };

  const systemEnabled = props.data['isEnabled'];

  // look for default time option
  let defaultTimeOption: TimeOption | undefined;
  const defaultTimeOptions = timeOptions.filter(to => to.isDefault);
  if (defaultTimeOptions.length === 1) {
    defaultTimeOption = defaultTimeOptions[0];
  }

  // look for preferred time option
  let prefTimeOption: TimeOption | undefined;
  if (props.data.notificationPreference !== null) {
    const filteredTimeOptions = timeOptions.filter(
      to => to.id === props.data.notificationPreference.timeOptionId
    );
    if (filteredTimeOptions.length === 1) {
      prefTimeOption = filteredTimeOptions[0];
    }
  }

  // initial value prioritises preferred time option, fallback on default
  if (prefTimeOption || defaultTimeOption) {
    const timeOption = prefTimeOption ? prefTimeOption : defaultTimeOption;
    if (!selectedOption || selectedOption.id !== timeOption!.id) {
      setSelectedOption(timeOption);
    }
  }

  const handleSelect = (option: TimeOption) => {
    setSelectedOption(option);
    props.setStateHandler(props.rowIndex, option);
  };

  return (
    <Select2<TimeOption>
      filterable={false}
      items={timeOptions}
      itemRenderer={renderOption}
      onItemSelect={handleSelect}
      noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
      disabled={!systemEnabled}
    >
      <Button
        text={selectedOption ? getUserFriendlyText(selectedOption) : 'Choose default'}
        rightIcon="caret-down"
        disabled={!systemEnabled}
      />
    </Select2>
  );
};

export default SelectCell;
