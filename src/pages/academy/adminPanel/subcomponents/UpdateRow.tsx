import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import controlButton from 'src/commons/ControlButton';
import { showSuccessMessage } from 'src/commons/utils/NotificationsHelper';

import { ConfigRow } from './AssessmentConfigPanel';

export type UpdateRowProps = DispatchProps & StateProps;

type DispatchProps = {
  handleUpdateAssessmentConfig: (assessmentConfiguration: AssessmentConfiguration) => void;
};

type StateProps = {
  data: ConfigRow;
};

const UpdateRow: React.FunctionComponent<UpdateRowProps> = props => {
  const handleSave = () => {
    showSuccessMessage('Saved', 1000);
  };
  return <>{controlButton('', IconNames.FLOPPY_DISK, handleSave)}</>;
};

export default UpdateRow;
