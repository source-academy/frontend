/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { ColDef } from 'ag-grid-community';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import { useEffect } from 'react';
import * as React from 'react';
import { LineChart } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { Legend } from 'recharts';
import { Tooltip } from 'recharts';
import { Line } from 'recharts';
import { XAxis } from 'recharts';
import { YAxis } from 'recharts';
import { CartesianGrid } from 'recharts';
import { Label } from 'recharts';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import Constants from '../../../../commons/utils/Constants';

export type EfficiencyPanelProps = DispatchProps & StateProps;

type DispatchProps = {};

type StateProps = {
  data: AssessmentOverview;
  question_id: integer;
};

const EfficiencyPanel: React.FunctionComponent<EfficiencyPanelProps> = props => {
  const { data, question_id } = props;

  const defaultColumnDefs: ColDef = {
    flex: 1,
    filter: true,
    resizable: true,
    sortable: true
  };

  const [rowData, setRowData] = useState<Array<any>>();

  const restfulUrl = `${Constants.backendUrl}/v2/efficiency/${data.id}/${question_id}/efficiency_real_data`;

  function parse_element(str: string) {
    const obj = {} as any;
    const arr = str.split(',');
    if (arr[0] === '') arr.shift();

    const arr1 = arr.map((element: string) => element.substring(element.indexOf(':') + 1));

    if (arr1[0] !== 'null' && arr1[3] !== 'null') {
      const updated_at = arr1[3].slice(1, -1);
      const inserted_at = arr1[0].slice(1, -1);
      obj.time = new Date(updated_at).getTime() - new Date(inserted_at).getTime();
    } else {
      obj.time = 0;
    }
    obj.tries = parseInt(arr1[1]);
    obj.sid = arr1[2];
    if (arr1[4] !== null && arr1[5] !== null) {
      obj.score = parseInt(arr1[4]) + parseInt(arr1[5]);
    } else {
      obj.score = 0;
    }

    let timeScore = obj.time / 5;
    let runtimesScore = obj.tries / 10;
    if (timeScore > 1) {
      timeScore = 1;
    }
    if (runtimesScore > 1) {
      runtimesScore = 1;
    }
    const Effort = 50 * timeScore + 50 * runtimesScore;
    obj.effort = Effort;

    return obj;
  }

  function parse_rowData(str: string) {
    let array = str.split('}');
    array.pop();
    array = array.map((str: string) => parse_element(str));
    return array;
  }

  useEffect(() => {
    fetch(restfulUrl)
      .then(result => result.json())
      .then(rowData =>
        setRowData(parse_rowData(rowData).sort((a: any, b: any) => a.effort - b.effort))
      );
    // eslint-disable-next-line
  }, []);

  console.log(typeof rowData);

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        defaultColDef={defaultColumnDefs}
        rowData={rowData}
        rowHeight={30}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      >
        <AgGridColumn field="sid"></AgGridColumn>
        <AgGridColumn field="time"></AgGridColumn>
        <AgGridColumn field="tries"></AgGridColumn>
        <AgGridColumn field="effort"></AgGridColumn>
        <AgGridColumn field="score"></AgGridColumn>
      </AgGridReact>
    </div>
  );

  console.log(rowData);

  return (
    <>
      <div>{grid}</div>
      <div>
        <ResponsiveContainer width="140%" aspect={3}>
          <LineChart data={rowData} margin={{ left: 10, right: 310 }}>
            <CartesianGrid />
            <XAxis dataKey="effort" interval={'preserveStartEnd'}>
              <Label value="Effort" position={{ x: 460, y: 5 }} />
            </XAxis>
            <YAxis>
              <Label value="Assessment    Score" angle={90} position={{ x: 8, y: 170 }} />
            </YAxis>
            <Legend />
            <Tooltip trigger="hover" />
            <Line dataKey="score" stroke="red" activeDot={{ r: 8 }} dot={{ r: 4 }}></Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default EfficiencyPanel;
