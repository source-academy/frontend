import React from 'react';

export const useInput = (entity: any, field: string) => {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!entity) {
      setValue('');
      return;
    }
    setValue(entity[field]);
  }, [entity, field]);

  return {
    value,
    setValue,
    inputProps: {
      value,
      onChange: (event: any) => {
        setValue(event.target.value);
      }
    },
    onDateChange: (date: Date) => {
      setValue(date && date.toString());
    }
  };
};
