import React from 'react';

export function useRequest<T>(requestFn: () => Promise<T>, defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    (async () => {
      setValue(await requestFn());
    })();
  }, [requestFn]);

  return { value, setValue };
}

export function useField<T>(entity: any, field: string, defaultValue: T) {
  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    if (!entity) {
      setValue(defaultValue);
      return;
    }
    setValue(entity[field]);
  }, [defaultValue, entity, field]);

  return {
    value,
    setValue,
    inputProps: {
      value,
      onChange: (event: any) => {
        setValue(event.target.value);
      }
    }
  };
}
