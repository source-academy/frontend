import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import clsx from 'clsx';

const AssessmentNotFound: React.FC = () => (
  <div className={clsx('NoPage', Classes.DARK)}>
    <NonIdealState
      icon={IconNames.ERROR}
      title="Assessment Not Found"
      description="Please check the top right dropdown menu to see if you are in the right course."
    />
  </div>
);

export default AssessmentNotFound;
