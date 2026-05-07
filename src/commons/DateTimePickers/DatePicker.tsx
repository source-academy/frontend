import { Button, Classes, Divider, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
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
  const [selectedDatetime, setSelectedDatetime] = useState<Date | undefined>(value);

  useEffect(() => {
    setSelectedDatetime(value);
  }, [value]);

  const handleSelectDate = (date: Date | undefined) => {
    if (selectedDatetime && date) {
      const newDatetime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedDatetime.getHours(),
        selectedDatetime.getMinutes(),
        selectedDatetime.getSeconds()
      );
      setSelectedDatetime(newDatetime);
      onChange(newDatetime);
    } else {
      setSelectedDatetime(date);
      onChange(date || null);
    }
  };

  const handleTimeChange = (time: Date) => {
    if (selectedDatetime) {
      const newDatetime = new Date(
        selectedDatetime.getFullYear(),
        selectedDatetime.getMonth(),
        selectedDatetime.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );
      onChange(newDatetime);
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
        selected={selectedDatetime}
        onSelect={handleSelectDate}
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
                // @ts-expect-error - mismatched types
                onClick={onClick}
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
            // @ts-expect-error - mismatched types
            return <HTMLSelect minimal {...props} />;
          },
          NextMonthButton({ onClick }) {
            return (
              // @ts-expect-error - mismatched types
              <Button icon={IconNames.CHEVRON_RIGHT} variant="minimal" onClick={onClick} />
            );
          },
          PreviousMonthButton({ onClick }) {
            return (
              // @ts-expect-error - mismatched types
              <Button icon={IconNames.CHEVRON_LEFT} variant="minimal" onClick={onClick} />
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
