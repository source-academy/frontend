import { Button, InputGroup, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useState } from 'react';

import GradingFlex from '../grading/GradingFlex';
import DatePicker from './DatePicker';

type DateInputProps = {
  value?: string;
  onChange: (date: string | null) => void;
  onError?: () => void;
  formatDate: (date: Date) => string;
  parseDate: (str: string) => Date | false;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  fill?: boolean;
  closeOnSelection?: boolean;
  timePrecision?: 'second' | 'minute' | 'hour';
  disableTimezoneSelect?: boolean;
};

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  onError,
  formatDate,
  parseDate,
  placeholder = 'MM/DD/YYYY',
  minDate,
  maxDate,
  fill,
  closeOnSelection,
  timePrecision,
  disableTimezoneSelect
}) => {
  void timePrecision;
  void disableTimezoneSelect;
  const [inputValue, setInputValue] = useState(value ? formatDate(new Date(value)) : '');
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseDate(newValue);
    if (parsed !== false) {
      onChange(parsed.toISOString());
    }
  };

  const handleDateTimeChange = (datetime: Date | null) => {
    if (datetime) {
      const formatted = formatDate(datetime);
      setInputValue(formatted);
      onChange(datetime.toISOString());
      if (closeOnSelection) {
        setIsOpen(false);
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputValue) {
      onChange(null);
      return;
    }

    const parsed = parseDate(inputValue);
    if (parsed === false && onError) {
      onError();
    }
  };

  const datePickerContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <DatePicker
        value={value ? new Date(value) : undefined}
        onChange={handleDateTimeChange}
        minDate={minDate}
        maxDate={maxDate}
        showTimePicker
        showActionsBar
      />
    </div>
  );

  return (
    <GradingFlex alignItems="center" style={{ columnGap: '0.5rem' }}>
      <InputGroup
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        fill={fill}
        style={{ flex: 1 }}
      />
      <Popover
        isOpen={isOpen}
        onInteraction={setIsOpen}
        content={datePickerContent}
        placement="bottom-start"
      >
        <Button icon={IconNames.CALENDAR} />
      </Popover>
    </GradingFlex>
  );
};

export default DateInput;
