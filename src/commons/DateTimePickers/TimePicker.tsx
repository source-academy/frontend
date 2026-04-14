import { NumericInput } from '@blueprintjs/core';
import React from 'react';

type TimePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  showArrowButtons?: boolean;
};

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, showArrowButtons = false }) => {
  const hours = value ? value.getHours() : 0;
  const minutes = value ? value.getMinutes() : 0;
  const seconds = value ? value.getSeconds() : 0;

  const handleHoursChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const newHours = parseInt(e.target.value, 10);
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(newHours);
    onChange(newDate);
  };

  const handleMinutesChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const newMinutes = parseInt(e.target.value, 10);
    const newDate = value ? new Date(value) : new Date();
    newDate.setMinutes(newMinutes);
    onChange(newDate);
  };

  const handleSecondsChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const newSeconds = parseInt(e.target.value, 10);
    const newDate = value ? new Date(value) : new Date();
    newDate.setSeconds(newSeconds);
    onChange(newDate);
  };

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  const handleWheel = (
    e: React.WheelEvent<HTMLInputElement>,
    field: 'hours' | 'minutes' | 'seconds'
  ) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newDate = value ? new Date(value) : new Date();

    if (field === 'hours') {
      const newHours = (newDate.getHours() + delta + 24) % 24;
      newDate.setHours(newHours);
    } else if (field === 'minutes') {
      const newMinutes = (newDate.getMinutes() + delta + 60) % 60;
      newDate.setMinutes(newMinutes);
    } else if (field === 'seconds') {
      const newSeconds = (newDate.getSeconds() + delta + 60) % 60;
      newDate.setSeconds(newSeconds);
    }
    onChange(newDate);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <NumericInput
        value={formatNumber(hours)}
        onChange={handleHoursChange}
        onWheel={e => handleWheel(e, 'hours')}
        min={0}
        max={23}
        style={{ width: '50px', textAlign: 'center' }}
        buttonPosition={showArrowButtons ? 'right' : 'none'}
      />
      <span>:</span>
      <NumericInput
        value={formatNumber(minutes)}
        onChange={handleMinutesChange}
        onWheel={e => handleWheel(e, 'minutes')}
        min={0}
        max={59}
        style={{ width: '50px', textAlign: 'center' }}
        buttonPosition={showArrowButtons ? 'right' : 'none'}
      />
      <span>:</span>
      <NumericInput
        value={formatNumber(seconds)}
        onChange={handleSecondsChange}
        onWheel={e => handleWheel(e, 'seconds')}
        min={0}
        max={59}
        style={{ width: '50px', textAlign: 'center' }}
        buttonPosition={showArrowButtons ? 'right' : 'none'}
      />
    </div>
  );
};

export default TimePicker;
