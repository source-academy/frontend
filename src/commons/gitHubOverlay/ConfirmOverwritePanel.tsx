import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

export const ConfirmOverwritePanel = () => {
  return (
    <div className={classNames(Classes.DIALOG_BODY, 'overwrite-step')}>
      Warning: opening this file will overwrite the text data in the editor. Please click 'Submit'
      to continue, or close the dialog to stop.
    </div>
  );
};
