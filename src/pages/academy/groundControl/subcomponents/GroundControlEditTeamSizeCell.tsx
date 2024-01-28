import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Flex } from '@tremor/react';
import React, { useCallback } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';

type Props = DispatchProps & StateProps;

type DispatchProps = {
  onTeamSizeChange: (id: number, newTeamSize: number) => void;
};

type StateProps = {
  data: AssessmentOverview;
};

const EditTeamSizeCell: React.FC<Props> = ({ data, onTeamSizeChange }) => {
  const minTeamSize = 1; // Corresponds to an individual assessment
  const teamSize = data.maxTeamSize;

  const changeTeamSize = useCallback(
    (size: number) => {
      if (teamSize === size) {
        return;
      }
      onTeamSizeChange(data.id, size);
    },
    [data.id, teamSize, onTeamSizeChange]
  );

  const handleIncrement = () => {
    const updatedTeamSize = teamSize + 1;
    changeTeamSize(updatedTeamSize);
  };

  const handleDecrement = () => {
    if (teamSize > minTeamSize) {
      const updatedTeamSize = teamSize - 1;
      changeTeamSize(updatedTeamSize);
    }
  };

  return (
    <Flex>
      <Button
        size="xs"
        icon={() => <BpIcon icon={IconNames.MINUS} />}
        variant="light"
        onClick={handleDecrement}
        disabled={teamSize === minTeamSize}
      />
      <span>{teamSize}</span>
      <Button
        size="xs"
        icon={() => <BpIcon icon={IconNames.PLUS} />}
        variant="light"
        onClick={handleIncrement}
      />
    </Flex>
  );
};

export default EditTeamSizeCell;
