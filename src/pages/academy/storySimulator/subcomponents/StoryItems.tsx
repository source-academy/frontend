import * as React from 'react';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';

import { StoryDetail } from '../features/StorySimulatorTypes';

type OwnProps = {
  storyList: StoryDetail[];
  includeStory: (storyId: string) => void;
};

function StoryItems({ storyList, includeStory }: OwnProps) {
  if (!storyList.length) {
    return <div className="VerticalStack StoryItems">No Stories Loaded</div>;
  }

  const columnDefs = [
    { headerName: 'Filename', field: 'filename' },
    { headerName: 'Open Date', field: 'openAt' },
    { headerName: 'Close Date', field: 'closeAt' }
  ];

  return (
    <>
      <AgGridReact columnDefs={columnDefs} rowData={storyList}></AgGridReact>
    </>
  );
}

export default StoryItems;
