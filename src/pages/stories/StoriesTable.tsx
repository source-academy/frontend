import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ColDef } from 'ag-grid-community';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import React, { useMemo } from 'react';
import GradingFlex from 'src/commons/grading/GradingFlex';
import { StoryListView } from 'src/features/stories/StoriesTypes';
import classes from 'src/styles/Stories.module.scss';

type Props = {
  headers: Array<{ id: string; header: string }>;
  stories: StoryListView[];
  storyActions: (stor: StoryListView) => React.ReactNode;
};

const MAX_EXCERPT_LENGTH = 35;

const truncate = (content: string) => {
  return content.replaceAll(/\s+/g, ' ').length <= MAX_EXCERPT_LENGTH
    ? content.replaceAll(/\s+/g, ' ')
    : content.split(/\s+/).reduce((acc, cur) => {
        return acc.length + cur.length <= MAX_EXCERPT_LENGTH ? acc + ' ' + cur : acc;
      }, '') + '…';
};

const defaultColDef: ColDef<StoryListView> = {
  cellClass: ({ data }) => (data?.isPinned ? classes['highlight-row'] : '')
};

const StoriesTable: React.FC<Props> = ({ headers, stories, storyActions }) => {
  const columns: ColDef<StoryListView>[] = useMemo(
    () => [
      { flex: 2, field: 'authorName', headerName: 'Author' },
      {
        flex: 4,
        field: 'title',
        headerName: 'Title',
        cellRenderer: ({ data, value }: CustomCellRendererProps<StoryListView>) =>
          data && (
            <GradingFlex alignItems="center" style={{ columnGap: 8 }}>
              {data.isPinned && <Icon icon={IconNames.PIN} />}
              {value}
            </GradingFlex>
          )
      },
      {
        flex: 6,
        field: 'content',
        headerName: 'Content',
        valueFormatter: ({ value }) => truncate(value),
        cellStyle: { textAlign: 'left' }
      },
      {
        flex: 3,
        field: 'actions' as any,
        headerName: 'Actions',
        cellRenderer: ({ data }: CustomCellRendererProps<StoryListView>) => storyActions(data!)
      }
    ],
    [storyActions]
  );

  return (
    <div className="ag-theme-quartz" style={{ marginTop: 40 }}>
      <AgGridReact
        rowData={stories}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        suppressMovableColumns
        suppressCellFocus
      />
    </div>
  );
};

export default StoriesTable;
