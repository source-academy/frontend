import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Button
        small
        minimal
        icon={IconNames.MINUS}
        onClick={handleDecrement}
        disabled={teamSize === minTeamSize}
      />
      <span>{teamSize}</span>
      <Button small minimal icon={IconNames.PLUS} onClick={handleIncrement} />
    </div>
  );
};

export default EditTeamSizeCell;
