import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColumnFilter } from '@tanstack/react-table';
import React from 'react';

import { getBadgeColorFromLabelLegacy } from '../../grading/subcomponents/GradingBadges';

// TODO: Remove after migration is completed
const TREMOR_TO_BLUEPRINT_INTENT: Record<string, Intent> = {
  indigo: Intent.PRIMARY,
  emerald: Intent.SUCCESS,
  sky: Intent.PRIMARY,
  purple: Intent.PRIMARY,
  gray: Intent.NONE,
  red: Intent.DANGER,
  yellow: Intent.WARNING,
  green: Intent.SUCCESS,
  blue: Intent.PRIMARY
};

type Props = {
  filter: ColumnFilter;
  onRemove: (filter: ColumnFilter) => void;
};

const FilterBadge: React.FC<Props> = ({ filter, onRemove }) => {
  let filterValue = filter.value as string;
  filterValue = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  const legacyColor = getBadgeColorFromLabelLegacy(filterValue);
  const intent = TREMOR_TO_BLUEPRINT_INTENT[legacyColor] || Intent.NONE;

  return (
    <Button intent={intent} icon={IconNames.CROSS} onClick={() => onRemove(filter)}>
      {filterValue}
    </Button>
  );
};

export { FilterBadge };
