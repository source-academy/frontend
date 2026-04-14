import { Button, Classes, Divider, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { Matcher } from 'react-day-picker';
import {
  DayPicker,
  MonthCaption as DayPickerMonthCaption,
  Nav as DayPickerNav
} from 'react-day-picker';

import GradingFlex from '../grading/GradingFlex';
import TimePicker from './TimePicker';

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | null) => void;
  showActionsBar?: boolean;
  highlightCurrentDay?: boolean;
  showTimePicker?: boolean;
  timePickerProps?: {
    showArrowButtons?: boolean;
  };
  minDate?: Date;
  maxDate?: Date;
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  // TODO: Unused for now
  showActionsBar,
  highlightCurrentDay,
  showTimePicker,
  timePickerProps,
  minDate,
  maxDate
}) => {
  const [selected, setSelected] = useState<Date | undefined>(value);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      onChange(date);
    }
  };

  const handleTimeChange = (time: Date) => {
    if (selected) {
      const newDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );
      onChange(newDate);
    }
  };

  const hidden: Matcher[] = [];
  if (minDate) {
    hidden.push({ before: minDate });
  }
  if (maxDate) {
    hidden.push({ after: maxDate });
  }

  return (
    <div className="bp6-datepicker">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        hidden={hidden.length > 0 ? hidden : undefined}
        startMonth={minDate ? new Date(minDate.getFullYear(), minDate.getMonth()) : undefined}
        endMonth={maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth()) : undefined}
        showOutsideDays
        captionLayout="dropdown"
        components={{
          Nav(props) {
            return (
              <GradingFlex justifyContent="center">
                <DayPickerNav {...props} />
              </GradingFlex>
            );
          },
          DayButton({ day, modifiers, onClick }) {
            return (
              <Button
                variant="minimal"
                className={classNames(
                  modifiers.selected && Classes.ACTIVE,
                  (modifiers.selected || (highlightCurrentDay && modifiers.today)) &&
                    Classes.INTENT_PRIMARY
                )}
                disabled={modifiers.outside}
                onClick={onClick as any}
              >
                {day.date.getDate()}
              </Button>
            );
          },
          MonthCaption(props) {
            return (
              <>
                <GradingFlex justifyContent="center">
                  <DayPickerMonthCaption {...props} />
                </GradingFlex>
                <Divider />
              </>
            );
          },
          Dropdown(props) {
            return <HTMLSelect minimal {...(props as any)} />;
          },
          NextMonthButton({ onClick }) {
            return (
              <Button icon={IconNames.CHEVRON_RIGHT} variant="minimal" onClick={onClick as any} />
            );
          },
          PreviousMonthButton({ onClick }) {
            return (
              <Button icon={IconNames.CHEVRON_LEFT} variant="minimal" onClick={onClick as any} />
            );
          }
        }}
      />
      {showTimePicker && (
        <>
          <Divider />
          <GradingFlex justifyContent="center">
            <TimePicker
              value={value}
              onChange={handleTimeChange}
              showArrowButtons={timePickerProps?.showArrowButtons}
            />
          </GradingFlex>
        </>
      )}
    </div>
  );
};

export default DatePicker;
