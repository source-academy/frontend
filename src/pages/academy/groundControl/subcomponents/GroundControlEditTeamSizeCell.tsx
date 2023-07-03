
import { IconNames } from '@blueprintjs/icons';
import '@tremor/react/dist/esm/tremor.css';
import { Icon as BpIcon } from '@blueprintjs/core';

import {
  Button,
  Flex,
} from '@tremor/react';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';


export type EditTeamSizeCellProps = DispatchProps & StateProps;

type DispatchProps = {
//   handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
};

type StateProps = {
  data: AssessmentOverview;
};



const EditTeamSizeCell: React.FunctionComponent<EditTeamSizeCellProps> = props => {
  const minTeamSize = 1;
  const maxTeamSize = 100;
  const { data } = props;
  const currentTeamSize = data.maxTeamSize;

  const [value, setValue] = React.useState(currentTeamSize);


  return (
    <div className="number-input">
      <Flex>
        <input
          type="number"
          className="input-value"
          value={value}
          onChange={e => {    
            const inputValue = parseInt(e.target.value);
            if (!isNaN(inputValue) && inputValue >= minTeamSize && inputValue <= maxTeamSize) {
              setValue(inputValue);
            }}}
          style={{ width: '4rem', padding: '0.2rem', textAlign: 'center' }}
        />
      </Flex>
    </div>
  );
};

export default EditTeamSizeCell;