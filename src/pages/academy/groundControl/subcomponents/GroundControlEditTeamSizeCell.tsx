import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Button, Flex } from '@tremor/react';
import React, { useCallback, useEffect, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';

type Props = DispatchProps & StateProps;

type DispatchProps = {
  setAssessmentOverview: (val: AssessmentOverview[]) => void;
  setHasChangesAssessmentOverview: (val: boolean) => void;
};

type StateProps = {
  assessmentOverviews: React.MutableRefObject<AssessmentOverview[]>;
  data: AssessmentOverview;
};

const EditTeamSizeCell: React.FC<Props> = props => {
  const minTeamSize = 1; // Corresponds to an individual assessment

  const { assessmentOverviews, setAssessmentOverview, setHasChangesAssessmentOverview, data } =
    props;

  const index = assessmentOverviews.current.findIndex(assessment => assessment.id === data.id);
  const [newTeamSize, setNewTeamSize] = useState(data.maxTeamSize);

  const handleTeamSizeChange = useCallback(() => {
    const temp = [...assessmentOverviews.current];
    if (data.maxTeamSize !== newTeamSize) {
      temp[index] = {
        ...temp[index],
        maxTeamSize: newTeamSize
      };
      setHasChangesAssessmentOverview(true);
      setAssessmentOverview(temp);
    }
  }, [
    assessmentOverviews,
    data.maxTeamSize,
    index,
    newTeamSize,
    setAssessmentOverview,
    setHasChangesAssessmentOverview
  ]);

  useEffect(() => {
    if (index !== -1) {
      handleTeamSizeChange();
    }
  }, [handleTeamSizeChange, index]);

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
    <Flex>
      <Button
        size="xs"
        icon={() => <BpIcon icon={IconNames.MINUS} />}
        variant="light"
        onClick={handleDecrement}
        disabled={newTeamSize === minTeamSize}
      />
      <span>{newTeamSize}</span>
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
