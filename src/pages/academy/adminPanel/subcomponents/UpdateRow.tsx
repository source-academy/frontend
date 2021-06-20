import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AssessmentConfiguration } from '../../../../commons/assessment/AssessmentTypes';
import controlButton from '../../../../commons/ControlButton';
import { showSuccessMessage } from '../../../../commons/utils/NotificationsHelper';

export type UpdateRowProps = DispatchProps & StateProps;

type DispatchProps = {
  handleUpdateAssessmentConfig: (assessmentConfiguration: AssessmentConfiguration) => void;
};

type StateProps = {
  data: AssessmentConfiguration;
};

const UpdateRow: React.FunctionComponent<UpdateRowProps> = props => {
  const handleSave = () => {
    showSuccessMessage('Saved', 1000);
  };
  return <>{controlButton('', IconNames.FLOPPY_DISK, handleSave)}</>;
};

export default UpdateRow;
