import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import * as React from 'react';

import { StoryDetail } from '../../../../features/storySimulator/StorySimulatorTypes';

type OwnProps = {
  storyList: StoryDetail[];
};

function StoryItems({ storyList }: OwnProps) {
  const [gridApi, setGridApi] = React.useState<any>();
  function setParams(params: any) {
    setGridApi(params.api);
  }

  function onSelectChange() {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes!.map((node: any) => node.data);
    return selectedData;
  }

  if (!storyList.length) {
    return <div className="VerticalStack StoryItems">No Stories Loaded</div>;
  }

  const columnDefs = [
    { headerName: 'Filename', field: 'filename', checkboxSelection: true },
    { headerName: 'Open Date', field: 'openAt' },
    { headerName: 'Close Date', field: 'closeAt' }
  ];

  return (
    <>
      <div className="ag-theme-alpine" style={{ height: '200px', width: '600px' }}>
        <AgGridReact
          onGridReady={setParams}
          rowSelection={'multiple'}
          columnDefs={columnDefs}
          rowData={storyList}
          onSelectionChanged={onSelectChange}
        />
      </div>
    </>
  );
}

export default StoryItems;
