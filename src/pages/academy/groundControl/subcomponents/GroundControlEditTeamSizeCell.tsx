import '@tremor/react/dist/esm/tremor.css';

import {
  Flex,
} from '@tremor/react';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';

export type EditTeamSizeCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleAssessmentChangeTeamSize: (id: number, maxTeamSize: number) => void;
};

type StateProps = {
  data: AssessmentOverview;
};



const EditTeamSizeCell: React.FunctionComponent<EditTeamSizeCellProps> = props => {
  const minTeamSize = 1;

  const { handleAssessmentChangeTeamSize, data } = props;
  const currentTeamSize = data.maxTeamSize;

  const [newTeamSize, setNewTeamSize] = React.useState(currentTeamSize || minTeamSize);

  
  const handleUpdateTeamSize = React.useCallback(() => {
    const { id } = data;
    handleAssessmentChangeTeamSize(
      id,
      newTeamSize
    );

  }, [ newTeamSize, handleAssessmentChangeTeamSize ]);

  return (
    <div className="number-input">
      <Flex>
        <input
          type="number"
          className="input-value"
          value={newTeamSize}
          onChange={e => {    
            const inputValue = parseInt(e.target.value);
            if (!isNaN(inputValue) && inputValue >= minTeamSize) {
              setNewTeamSize(inputValue);
            }}}
          style={{ width: '4rem', padding: '0.2rem', textAlign: 'center' }}
        />
        <button onClick={handleUpdateTeamSize}>
          update
        </button>
      </Flex>
    </div>
  );
};

export default EditTeamSizeCell;