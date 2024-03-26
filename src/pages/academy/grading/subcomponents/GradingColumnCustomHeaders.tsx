import { Icon } from '@blueprintjs/core';
import { CustomHeaderProps } from 'ag-grid-react';
import { useState } from 'react';

import { getNextSortState, SortStates } from './GradingSubmissionsTable';

export interface GradingColumnCustomHeadersProps extends CustomHeaderProps {
  hideColumn: (id: string) => void;
  newSortState: (id: string, sortState: SortStates) => void;
}

const GradingColumnCustomHeaders: React.FC<GradingColumnCustomHeadersProps> = (props: GradingColumnCustomHeadersProps) => {

  // The values correspond to the available icons in the BlueprintJS library. "sort" means unsorted.
  const [sortState, setSortState] = useState<SortStates>(SortStates.NONE);

  const nextSortState = () => {
    setSortState((prev) => getNextSortState(prev));
    props.newSortState(props.column.getColId(), getNextSortState(sortState));
  }

  return (
    <div className={String(props.eGridHeader.classList)}>
      <span className="ag-header-cell-text">{props.displayName}</span>
      <div className="grading-table-col-icons grading-table-sort-cols" onClick={(e) => nextSortState()}>
        <Icon icon={sortState} />
      </div>
      <div className="grading-table-col-icons grading-table-hide-cols" onClick={(e) => props.hideColumn(props.column.getColId())}>
        <Icon icon="eye-off" />
      </div>
    </div>
  );
  
};

export default GradingColumnCustomHeaders;