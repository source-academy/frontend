import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  Button,
  Flex,
} from '@tremor/react';
import { isEqual, isUndefined } from 'lodash';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';

export type EditTeamSizeCellProps = DispatchProps & StateProps;

type DispatchProps = {
  setAssessmentOverview: (val: AssessmentOverview[]) => void;
  setHasChangesAssessmentOverview: (val: boolean) => void;
};

type StateProps = {
  assessmentOverviews: React.MutableRefObject<AssessmentOverview[]>;
  data: AssessmentOverview;
};

// export type EditTeamSizeCellProps = OwnProps;

// type OwnProps = {
//   assessmentOverview: React.MutableRefObject<AssessmentOverview[]>;
//   setAssessmentOverview: (assessmentOverview: AssessmentOverview[]) => void;
//   setHasChangesAssessmentOverview: (val: boolean) => void;
// };



const EditTeamSizeCell: React.FunctionComponent<EditTeamSizeCellProps> = props => {
  const minTeamSize = 1;

  const { assessmentOverviews, setAssessmentOverview, data } = props;

  const currentTeamSize = data.maxTeamSize;

  const index = indexOfObject(assessmentOverviews.current, data);

  const [newTeamSize, setNewTeamSize] = React.useState(currentTeamSize);

  const handleTeamSizeChange = (index: number, maxTeamSize: number) => {
    const temp = [...assessmentOverviews.current];
    temp[index] = {
      ...temp[index],
      maxTeamSize: maxTeamSize
    };

    setAssessmentOverview(temp);
  }

  const handleIncrement = () => {
    const updatedTeamSize = newTeamSize + 1;
    setNewTeamSize(updatedTeamSize);
    handleTeamSizeChange(index, updatedTeamSize);
  };
  
  const handleDecrement = () => {
    if (newTeamSize > minTeamSize) {
      const updatedTeamSize = newTeamSize - 1;
      setNewTeamSize(updatedTeamSize);
      handleTeamSizeChange(index, updatedTeamSize);
    }
  };

  return (
    <div className="number-input">
      <Flex>
        <Button
          size="xs"
          icon={() => <BpIcon icon={IconNames.MINUS} />}
          variant="light"
          onClick={handleDecrement}
          disabled={newTeamSize === minTeamSize}
        />
        <span style={{ width: '4rem', padding: '0.2rem', textAlign: 'center' }}>
          {newTeamSize}
        </span>
        <Button
          size="xs"
          icon={() => <BpIcon icon={IconNames.PLUS} />}
          variant="light"
          onClick={handleIncrement}
        />
      </Flex>
      
    </div>
  );
};

function indexOfObject(arr: AssessmentOverview[], obj: AssessmentOverview): number {
  if (isUndefined(arr)) {
    return -1;
  }
  for (let i = 0; i < arr.length; i++) {
    if (isEqual(arr[i].id, obj.id)) {
      return i;
    }
  }
  return -1;
}

export default EditTeamSizeCell;