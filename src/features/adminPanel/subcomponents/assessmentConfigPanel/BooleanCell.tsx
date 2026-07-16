import { Switch } from '@blueprintjs/core';
import { useCallback } from 'react';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import type { KeysOfType } from 'src/commons/utils/TypeHelper';

type Props = {
  data: AssessmentConfiguration;
  field: KeysOfType<AssessmentConfiguration, boolean>;
  onChange: (
    row: AssessmentConfiguration,
    field: KeysOfType<AssessmentConfiguration, boolean>,
    value: boolean,
  ) => void;
};

function BooleanCell({ data, field, onChange }: Props) {
  const checked = data[field];

  const changeHandler = useCallback(() => {
    onChange(data, field, !checked);
  }, [onChange, data, field, checked]);

  return <Switch checked={checked} onChange={changeHandler} />;
}

export default BooleanCell;
