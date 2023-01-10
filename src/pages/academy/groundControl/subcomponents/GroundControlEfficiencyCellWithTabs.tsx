/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Classes, Dialog,Tab, Tabs} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
//import { ColDef} from 'ag-grid-community';
//import { AgGridColumn, AgGridReact } from 'ag-grid-react';
//import { useState} from 'react';
//import { useEffect} from 'react';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';
//import Constants from '../../../../commons/utils/Constants';
import EfficiencyPanel from './GroundControlEfficiencyPanel';

export type DeleteCellProps = DispatchProps & StateProps;

type DispatchProps = {
  
};

type StateProps = {
  data: AssessmentOverview;
};

const EfficiencyCellWithTabs: React.FunctionComponent<DeleteCellProps> = props => {
  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);
  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const {data } = props;

  const EfficiencyPanelProps1 = {
    data: data,
    question_id: 1
  };
  
  const EfficiencyPanelProps2 = {
    data: data,
    question_id: 2
  };
  
  const EfficiencyPanelProps3 = {
    data: data,
    question_id: 3
  };
  
  const EfficiencyPanelProps4 = {
    data: data,
    question_id: 4
  };
  
  const EfficiencyPanelProps5 = {
    data: data,
    question_id: 5
  };

  return (
    <>
      <ControlButton icon={IconNames.TIME} onClick={handleOpenDialog} />
      <Dialog style={{width:550}}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Efficiency Detail"
        canOutsideClickClose={true}
      >
        <div className={Classes.DIALOG_BODY} style={{width:500}}>
          <p>
            <h4><b>{data.title}</b>-Efficiency Detail</h4> 
          </p>
           
			<Tabs id="admin-panel" renderActiveTabPanelOnly>
                <Tab id="1" title="Question 1" panel={<EfficiencyPanel {...EfficiencyPanelProps1} />} />
                <Tab id="2" title="Question 2" panel={<EfficiencyPanel {...EfficiencyPanelProps2} />} />
                <Tab id="3" title="Question 3" panel={<EfficiencyPanel {...EfficiencyPanelProps3} />} />
                <Tab id="4" title="Question 4" panel={<EfficiencyPanel {...EfficiencyPanelProps4} />} />
                <Tab id="5" title="Question 5" panel={<EfficiencyPanel {...EfficiencyPanelProps5} />} />
            </Tabs>

        </div>
  
		
      </Dialog>
    </>
  );
};

export default EfficiencyCellWithTabs;