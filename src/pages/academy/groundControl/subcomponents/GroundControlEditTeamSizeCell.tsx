
import { IconNames } from '@blueprintjs/icons';
import '@tremor/react/dist/esm/tremor.css';
import { Icon as BpIcon } from '@blueprintjs/core';

import {

  Button,
  Flex,
  Footer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput
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

  const handleIncrement = () => {
    setValue(value + 1);
  };

  const handleDecrement = () => {
    if (value > minTeamSize) {
      setValue(value - 1);
    }
  };

  return (
    <div className="number-input">
      <Flex justifyContent="justify-center" spaceX="space-x-3">
        <Button
          size="xs"
          icon={() => <BpIcon icon={IconNames.MINUS} />}
          variant="light"
          onClick={handleDecrement}
          disabled={value === minTeamSize}
        />
        <input
          type="number"
          className="input-value"
          value={value}
          readOnly
          style={{ width: '4rem', padding: '0.2rem', textAlign: 'center' }}
        />
        <Button
          size="xs"
          icon={() => <BpIcon icon={IconNames.PLUS} />}
          variant="light"
          onClick={handleIncrement}
          disabled={value === maxTeamSize}
        />
      </Flex>
    </div>
  );
};

export default EditTeamSizeCell;