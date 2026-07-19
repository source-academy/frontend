import { Button, Icon, Tooltip } from '@blueprintjs/core';
import type { CustomHeaderProps } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/commons/utils/Hooks';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import type { ColumnFieldsKeys, SortStateProperties } from 'src/features/grading/GradingTypes';
import { SortStates } from 'src/features/grading/GradingTypes';

import { freshSortState, getNextSortState } from './GradingSubmissionsTable';

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
 * `extraActions` slot. Sorting is server-side: this only writes the desired sortyar
 * into redux (`allColsSortStates`), which `Grading.tsx` reads to build the backend
 * query. Only the actively-sorted column shows a direction.
 */
function GradingSortIcon({ headerProps }: Props) {
  const colId = headerProps.column.getColId() as ColumnFieldsKeys;
  const dispatch = useAppDispatch();
  const colsSortState = useAppSelector(state => state.workspaces.grading.allColsSortStates);
  const [sortState, setSortState] = useState(SortStates.NONE);

  useEffect(() => {
    if (colsSortState.sortBy !== colId) {
      setSortState(SortStates.NONE);
    }
  }, [colsSortState, colId]);

  const handleClick = () => {
    const next = getNextSortState(sortState);
    setSortState(next);
    const newState: SortStateProperties = { ...freshSortState };
    newState[colId] = next;
    dispatch(WorkspaceActions.updateAllColsSortStates({ currentState: newState, sortBy: colId }));
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
        className="flex cursor-pointer rounded p-1.5 hover:bg-black/10"
        onClick={handleClick}
      >
        <Icon icon={sortState} />
      </Button>
    </Tooltip>
  );
}

export default GradingSortIcon;
