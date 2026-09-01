import { Button, Icon, Tooltip } from '@blueprintjs/core';
import type { CustomHeaderProps } from 'ag-grid-react';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import type { ColumnFieldsKeys, SortStateProperties } from 'src/features/grading/GradingTypes';
import { SortStates } from 'src/features/grading/GradingTypes';
import {
  freshSortState,
  getNextSortState,
  gradingSortParser,
} from 'src/features/grading/GradingUtils';

const SORT_TOOLTIP = {
  [SortStates.ASC]: 'Ascending',
  [SortStates.DESC]: 'Descending',
  [SortStates.NONE]: 'Default',
};

type Props = {
  headerProps: CustomHeaderProps;
};

/**
 * Grading-specific sort control injected into the generic `ColumnHeader` via its
 * `extraActions` slot. Sorting is server-side: this only writes the desired sort
 * into the URL (nuqs `sort`), which the overviews query reads to build the backend
 * request. Only the actively-sorted column shows a direction.
 */
function GradingSortIcon({ headerProps }: Props) {
  const colId = headerProps.column.getColId() as ColumnFieldsKeys;
  const [colsSortState, setColsSortState] = useQueryState('sort', gradingSortParser);
  const [sortState, setSortState] = useState(SortStates.NONE);

  useEffect(() => {
    setSortState(
      colsSortState.sortBy === colId ? colsSortState.currentState[colId] : SortStates.NONE,
    );
  }, [colsSortState, colId]);

  const handleClick = () => {
    const next = getNextSortState(sortState);
    setSortState(next);
    const newState: SortStateProperties = { ...freshSortState };
    newState[colId] = next;
    setColsSortState({ currentState: newState, sortBy: colId });
  };

  return (
    <Tooltip
      content={
        sortState === SortStates.NONE
          ? `Click to sort by ${headerProps.displayName}`
          : `Sorted by ${headerProps.displayName} (${SORT_TOOLTIP[sortState]})`
      }
      position="bottom"
    >
      <Button
        variant="minimal"
        aria-label={`Sort by ${headerProps.displayName}`}
        className="flex cursor-pointer rounded p-1.5 hover:bg-black/10"
        onClick={handleClick}
      >
        <Icon icon={sortState} />
      </Button>
    </Tooltip>
  );
}

export default GradingSortIcon;
