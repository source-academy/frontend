import { Icon } from '@blueprintjs/core';
import { CustomHeaderProps } from 'ag-grid-react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { SortStates } from 'src/features/grading/GradingTypes';

import { getNextSortState } from './GradingSubmissionsTable';

type Props = CustomHeaderProps & {
  hideColumn: (id: string) => void;
  updateSortState: (id: string, sortState: SortStates) => void;
  disabledSortCols: string[];
};

const GradingColumnCustomHeaders: React.FC<Props> = props => {
  // The values correspond to the available icons in the BlueprintJS library. "sort" means unsorted.
  const [sortState, setSortState] = useState(SortStates.NONE);
  const colsSortState = useTypedSelector(state => state.workspaces.grading.allColsSortStates);

  const nextSortState = () => {
    setSortState(prev => getNextSortState(prev));
    props.updateSortState(props.column.getColId(), getNextSortState(sortState));
  };

  useEffect(() => {
    if (colsSortState.sortBy !== props.column.getColId()) {
      setSortState(SortStates.NONE);
    }
  }, [colsSortState, props.column]);

  return (
    <div className={classNames(props.eGridHeader.classList)}>
      <span className="ag-header-cell-text">{props.displayName}</span>

      {!props.disabledSortCols.includes(props.column.getColId()) && (
        <div
          className="grading-table-col-icons grading-table-sort-cols"
          onClick={e => nextSortState()}
        >
          <Icon icon={sortState} />
        </div>
      )}

      <div
        className="grading-table-col-icons grading-table-hide-cols"
        onClick={e => props.hideColumn(props.column.getColId())}
      >
        <Icon icon="eye-off" />
      </div>
    </div>
  );
};

export default GradingColumnCustomHeaders;
