import React from 'react';

/* export interface FieldOptions {
  validationFunction?: (value: string | undefined) => boolean;
} */

export function useField<T extends HTMLInputElement | HTMLSelectElement>(
  validationFunction?: (value: string | undefined) => boolean
) {
  const ref = React.useRef<T | null>(null);
  const [isValid, setIsValid] = React.useState(true);

  const validate = React.useCallback(() => {
    const newIsValid = !validationFunction || validationFunction(ref.current?.value);
    if (isValid !== newIsValid) {
      setIsValid(newIsValid);
    }
    return newIsValid;
  }, [isValid, validationFunction]);

  const onChange = React.useCallback(() => void validate(), [validate]);

  return { ref, isValid, setIsValid, validate, onChange };
}

export type UseFieldObject = ReturnType<typeof useField>;

export function collectFieldValues(...fields: UseFieldObject[]): string[] | null {
  let allValid = true;
  const values = [];
  for (const field of fields) {
    if (field.ref.current) {
      const isValid = field.validate();
      allValid = allValid && isValid;
      values.push(field.ref.current?.value);
    } else {
      allValid = false;
    }
  }
  return allValid ? values : null;
}

export function checkFieldValidity(...fields: UseFieldObject[]): boolean {
  return fields.findIndex(({ isValid }) => !isValid) === -1;
}

export function resetFieldValidity(...fields: UseFieldObject[]) {
  for (const field of fields) {
    field.setIsValid(true);
  }
}

export function validateNotEmpty(value: string | undefined): boolean {
  return typeof value === 'string' && value.length > 0;
}
