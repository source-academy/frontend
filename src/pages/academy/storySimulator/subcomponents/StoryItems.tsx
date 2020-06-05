import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import * as React from 'react';

import { StoryDetail } from '../../../../features/storySimulator/StorySimulatorTypes';

type OwnProps = {
  storyList: StoryDetail[];
  includeStory: (storyId: string) => void;
};

function StoryItems({ storyList, includeStory }: OwnProps) {
  const [gridApi, setGridApi] = React.useState<any>();

  if (!storyList.length) {
    return <div className="VerticalStack StoryItems">No Stories Loaded</div>;
  }

  const columnDefs = [
    { headerName: 'Filename', field: 'filename', checkboxSelection: true },
    { headerName: 'Open Date', field: 'openAt' },
    { headerName: 'Close Date', field: 'closeAt' }
  ];

  const onButtonClick = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes!.map((node: any) => node.data);
    console.log(selectedData);
  };

  return (
    <>
      <div className="ag-theme-alpine" style={{ height: '200px', width: '600px' }}>
        <button onClick={onButtonClick}>Get selected rows</button>
        <AgGridReact
          onGridReady={(params: any) => setGridApi(params.api)}
          rowSelection={'multiple'}
          columnDefs={columnDefs}
          rowData={storyList}
          onSelectionChanged={onButtonClick}
        ></AgGridReact>
      </div>
    </>
  );
}

export default StoryItems;
