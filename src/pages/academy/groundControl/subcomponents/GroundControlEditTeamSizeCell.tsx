import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Flex } from '@tremor/react';
import { isEqual, isUndefined } from 'lodash';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
// import { consoleOverloads } from 'src/commons/utils/ConsoleOverload';

export type EditTeamSizeCellProps = DispatchProps & StateProps;

type DispatchProps = {
  setAssessmentOverview: (val: AssessmentOverview[]) => void;
  setHasChangesAssessmentOverview: (val: boolean) => void;
};

type StateProps = {
  assessmentOverviews: React.MutableRefObject<AssessmentOverview[]>;
  data: AssessmentOverview;
};

const EditTeamSizeCell: React.FunctionComponent<EditTeamSizeCellProps> = props => {
  const minTeamSize = 0;

  const { assessmentOverviews, setAssessmentOverview, setHasChangesAssessmentOverview, data } =
    props;

  const index = indexOfObject(assessmentOverviews.current, data);
  const [newTeamSize, setNewTeamSize] = React.useState(data.maxTeamSize);

  React.useEffect(() => {
    const handleTeamSizeChange = () => {
      const temp = [...assessmentOverviews.current];
      if (data.maxTeamSize !== newTeamSize) {
        temp[index] = {
          ...temp[index],
          maxTeamSize: newTeamSize
        };
        setHasChangesAssessmentOverview(true);
        setAssessmentOverview(temp);
      }
    };

    if (index !== -1) {
      handleTeamSizeChange();
    }
  }, [
    newTeamSize,
    index,
    assessmentOverviews,
    data.maxTeamSize,
    setHasChangesAssessmentOverview,
    setAssessmentOverview
  ]);

  const handleIncrement = () => {
    const updatedTeamSize = newTeamSize + 1;
    setNewTeamSize(updatedTeamSize);
  };

  const handleDecrement = () => {
    if (newTeamSize > minTeamSize) {
      const updatedTeamSize = newTeamSize - 1;
      setNewTeamSize(updatedTeamSize);
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
        <span style={{ width: '4rem', padding: '0.2rem', textAlign: 'center' }}>{newTeamSize}</span>
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
