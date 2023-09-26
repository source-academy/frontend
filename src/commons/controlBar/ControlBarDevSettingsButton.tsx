import {
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Field, FieldProps, Formik } from 'formik';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { changeModuleBackend } from '../application/actions/CommonsActions';
import ControlButton from '../ControlButton';
import { useTypedSelector } from '../utils/Hooks';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';

type DevSettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DevSettingsDialog: FC<DevSettingsDialogProps> = ({ isOpen: dialogOpen, onClose }) => {
  const moduleBackend = useTypedSelector(state => state.application.moduleBackend);
  const dispatch = useDispatch();
  return (
    <Formik
      initialValues={{
        moduleBackend
      }}
      onSubmit={({ moduleBackend }) => {
        dispatch(changeModuleBackend(moduleBackend));
        showSuccessMessage('Changed developer settings');
      }}
    >
      {({ submitForm, resetForm }) => {
        const handleOnClose = () => {
          resetForm();
          onClose();
        };

        return (
          <Dialog
            isOpen={dialogOpen}
            title="Developer Settings"
            onClose={handleOnClose}
            className={Classes.DARK}
          >
            <DialogBody>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Field
                  name="moduleBackend"
                  validate={(value: string) => {
                    if (value === '') {
                      return 'Invalid module backend!';
                    }
                    return undefined;
                  }}
                  validateOnBlur
                >
                  {({ field, meta: { error } }: FieldProps<string>) => (
                    <Tooltip2 content="URL to the modules server">
                      <FormGroup label="Module Backend" labelFor="module-backend-input">
                        <InputGroup className="module-backend-input" {...field} />
                        {error && (
                          <p
                            style={{
                              color: 'red'
                            }}
                          >
                            {error}
                          </p>
                        )}
                      </FormGroup>
                    </Tooltip2>
                  )}
                </Field>
              </div>
            </DialogBody>
            <DialogFooter>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  columnGap: '5px'
                }}
              >
                <Button
                  text="Save"
                  intent={Intent.PRIMARY}
                  onClick={() => {
                    submitForm();
                    handleOnClose();
                  }}
                />
                <Button text="Close" intent={Intent.DANGER} onClick={handleOnClose} />
              </div>
            </DialogFooter>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export const ControlBarDevSettingsButton: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <ControlButton
        label="Dev Settings"
        icon={IconNames.SETTINGS}
        onClick={() => setDialogOpen(true)}
      />
      <DevSettingsDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};
