import {
  Button,
  Callout,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Tooltip
} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { QrReader } from 'react-qr-reader';
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  deviceToEdit?: Device;
  defaultSecret?: string;
};

const enum FACING_MODE {
  USER = 'user',
  ENVIRONMENT = 'environment',
  LEFT = 'left',
  RIGHT = 'right'
}

const RemoteExecutionDeviceDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  deviceToEdit,
  defaultSecret
}) => {
  const dispatch = useDispatch();
  const nameField = useField<HTMLInputElement>(validateNotEmpty);
  const typeField = useField<HTMLSelectElement>();
  const secretField = useField<HTMLInputElement>(validateNotEmpty);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [showScanner, setShowScanner] = React.useState(false);
  const [cameraFacingMode, setCameraFacingMode] = React.useState(FACING_MODE.ENVIRONMENT);

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

  const scanButton = (
    <Tooltip content="Scan QR Code">
      <Button minimal icon="clip" onClick={() => setShowScanner(() => !showScanner)} />
    </Tooltip>
  );

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
      <DialogBody>
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
            ref={element => void (typeField.ref.current = element)}
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
          <InputGroup
            id="sa-remote-execution-secret"
            className={classNames(Classes.FILL, secretField.isValid || Classes.INTENT_DANGER)}
            type="text"
            inputRef={secretField.ref}
            onChange={secretField.onChange}
            disabled={isSubmitting}
            readOnly={!!deviceToEdit}
            defaultValue={defaultSecret}
            {...(deviceToEdit ? { value: deviceToEdit.secret } : { rightElement: scanButton })}
          />
        </FormGroup>

        {showScanner && (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              rowGap: '0.5rem'
            }}
          >
            <QrReader
              onResult={result => {
                if (result) {
                  setShowScanner(false);
                  const element = secretField.ref.current;
                  if (element) {
                    element.value = result.getText();
                  }
                }
              }}
              constraints={{
                aspectRatio: 1,
                frameRate: { ideal: 12 },
                deviceId: { ideal: '0' },
                facingMode: { ideal: cameraFacingMode }
              }}
              containerStyle={{ width: '50%', marginInline: 'auto' }}
              videoStyle={{ borderRadius: '0.3em' }}
            />
            <Button
              style={{ margin: 'auto' }}
              icon="refresh"
              onClick={() => {
                // Need to do this to force a refresh of the scanner component
                setShowScanner(false);
                setCameraFacingMode(() =>
                  cameraFacingMode === FACING_MODE.USER ? FACING_MODE.ENVIRONMENT : FACING_MODE.USER
                );
                setTimeout(() => setShowScanner(true), 1);
              }}
            >
              Change Camera
            </Button>
          </div>
        )}

        {errorMessage && <Callout intent="danger">{errorMessage}</Callout>}
      </DialogBody>
      <DialogFooter
        actions={
          <>
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
          </>
        }
      />
    </Dialog>
  );
};

export default RemoteExecutionDeviceDialog;
