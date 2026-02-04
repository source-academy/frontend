import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

const AssessmentNotFound: React.FC = () => (
  <div className={classNames('NoPage', Classes.DARK)}>
    <NonIdealState
      icon={IconNames.ERROR}
      title="Assessment Not Found"
      description="Please check the top right dropdown menu to see if you are in the right course."
    />
  </div>
);

export default AssessmentNotFound;
