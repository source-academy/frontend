import { Icon } from '@blueprintjs/core';
import { CustomHeaderProps } from 'ag-grid-react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { SortStates } from 'src/features/grading/GradingTypes';
import classes from 'src/styles/Grading.module.scss';

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
    <GradingFlex
      className={classNames(
        props.eGridHeader.classList,
        classes['grading-table-header-individual']
      )}
    >
      <span className="ag-header-cell-text">{props.displayName}</span>

      {!props.disabledSortCols.includes(props.column.getColId()) && (
        <div
          className={classNames(classes['grading-table-col-icons'], 'grading-table-sort-cols')}
          onClick={() => nextSortState()}
        >
          <Icon icon={sortState} />
        </div>
      )}

      <div
        className={classNames(classes['grading-table-col-icons'], 'grading-table-hide-cols')}
        onClick={() => props.hideColumn(props.column.getColId())}
      >
        <Icon icon="eye-off" />
      </div>
    </GradingFlex>
  );
};

export default GradingColumnCustomHeaders;
