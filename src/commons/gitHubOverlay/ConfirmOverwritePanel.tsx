import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

export const ConfirmOverwritePanel = (props: any) => {
  const { pickerType } = props;

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'overwrite-step')}>
      {pickerType === 'Open' && (
        <p>
          Warning: opening this file will overwrite the text data in the editor. Please click
          'Submit' to continue, or close the dialog to stop.{' '}
        </p>
      )}

      {pickerType === 'Save' && (
        <p>
          Warning: You are saving over an existing file in the repository. Please click 'Submit' to
          continue, or close the dialog to stop.{' '}
        </p>
      )}
    </div>
  );
};
