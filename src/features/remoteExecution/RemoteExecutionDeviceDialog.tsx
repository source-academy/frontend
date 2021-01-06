import { Button, Callout, Classes, Dialog, FormGroup, HTMLSelect } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';

import { editDevice, registerDevice } from '../../commons/sagas/RequestsSaga';
import { actions } from '../../commons/utils/ActionsHelper';
import {
  checkFieldValidity,
  collectFieldValues,
  useField,
  validateNotEmpty
} from '../../commons/utils/FormHelper';
import { Device, deviceTypes } from './RemoteExecutionTypes';

export interface RemoteExecutionDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deviceToEdit?: Device;
}

export default function RemoteExecutionDeviceDialog({
  isOpen,
  onClose,
  deviceToEdit
}: RemoteExecutionDeviceDialogProps) {
  const dispatch = useDispatch();
  const nameField = useField<HTMLInputElement>(validateNotEmpty);
  const typeField = useField<HTMLSelectElement>();
  const secretField = useField<HTMLInputElement>(validateNotEmpty);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const onSubmit = async () => {
    const fields = collectFieldValues(nameField, typeField, secretField);
    if (!fields) {
      return;
    }
    const [title, type, secret] = fields;

    try {
      setErrorMessage(undefined);
      setIsSubmitting(true);

      if (deviceToEdit) {
        await editDevice({ id: deviceToEdit.id, title });
      } else {
        await registerDevice({ title, type, secret });
      }
    } catch (e) {
      setErrorMessage(e?.message || 'Unknown error occurred.');
      setIsSubmitting(false);
      return;
    }

    dispatch(actions.remoteExecFetchDevices());
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Dialog
      icon={deviceToEdit ? 'edit' : 'add'}
      title={deviceToEdit ? `Edit ${deviceToEdit.title} (${deviceToEdit.type})` : 'Add new device'}
      isOpen={isOpen}
      className={Classes.DARK}
      onClose={onClose}
      canEscapeKeyClose={!isSubmitting}
      canOutsideClickClose={!isSubmitting}
      isCloseButtonShown={!isSubmitting}
      onOpening={() => {
        setErrorMessage(undefined);
        nameField.setIsValid(true);
        secretField.setIsValid(true);
      }}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup
          label="Name"
          labelFor="sa-remote-execution-name"
          helperText="Shown to you only. You can key in a different name from other users."
        >
          <input
            id="sa-remote-execution-name"
            className={classNames(
              Classes.INPUT,
              Classes.FILL,
              nameField.isValid || Classes.INTENT_DANGER
            )}
            type="text"
            ref={nameField.ref}
            onChange={nameField.onChange}
            disabled={isSubmitting}
            {...(deviceToEdit ? { defaultValue: deviceToEdit.title } : undefined)}
          />
        </FormGroup>

        <FormGroup label="Type" labelFor="sa-remote-execution-type">
          <HTMLSelect
            id="sa-remote-execution-type"
            className={classNames(Classes.FILL)}
            elementRef={element => void (typeField.ref.current = element)}
            disabled={isSubmitting || !!deviceToEdit}
            {...(deviceToEdit ? { value: deviceToEdit.type } : undefined)}
          >
            {deviceTypes.map(({ id, name }) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>

        <FormGroup label="Secret" labelFor="sa-remote-execution-secret">
          <input
            id="sa-remote-execution-secret"
            className={classNames(
              Classes.INPUT,
              Classes.FILL,
              secretField.isValid || Classes.INTENT_DANGER
            )}
            type="text"
            ref={secretField.ref}
            onChange={secretField.onChange}
            disabled={isSubmitting}
            readOnly={!!deviceToEdit}
            {...(deviceToEdit ? { value: deviceToEdit.secret } : undefined)}
          />
        </FormGroup>

        {errorMessage && <Callout intent="danger">{errorMessage}</Callout>}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={onSubmit}
            disabled={isSubmitting || !checkFieldValidity(nameField, secretField)}
          >
            {deviceToEdit ? 'Edit' : 'Add'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
