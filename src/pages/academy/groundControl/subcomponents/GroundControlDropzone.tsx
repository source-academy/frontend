import { Card, Elevation, HTMLSelect, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import type { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';

import ControlButton from '../../../../commons/ControlButton';
import { showWarningMessage } from '../../../../commons/utils/notifications/NotificationsHelper';

export type DropzoneProps = {
  handleUploadAssessment: (file: File, forceUpdate: boolean, assessmentConfigId: number) => void;
  assessmentConfigurations?: AssessmentConfiguration[];
};

function MaterialDropzone(props: DropzoneProps) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isWarningShown, setPromptShown] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [assessmentConfigId, setAssessmentConfigId] = useState(-1);

  useEffect(() => {
    if (props.assessmentConfigurations && assessmentConfigId === -1) {
      setAssessmentConfigId(props.assessmentConfigurations[0].assessmentConfigId);
    }
  }, [props.assessmentConfigurations, assessmentConfigId]);

  const { handleUploadAssessment } = props;

  const htmlSelectOptions = useMemo(() => {
    return props.assessmentConfigurations?.map(e => {
      return {
        value: e.assessmentConfigId,
        label: e.type,
      };
    });
  }, [props.assessmentConfigurations]);

  const handleConfirmUpload = useCallback(() => {
    if (assessmentConfigId === -1) {
      showWarningMessage('Please select a valid assessment type before uploading!');
      return;
    }
    if (file) {
      handleUploadAssessment(file, forceUpdate, assessmentConfigId);
      setForceUpdate(false);
    }
    setFile(undefined);
  }, [file, forceUpdate, handleUploadAssessment, assessmentConfigId]);
  const handleCancelUpload = useCallback(() => setFile(undefined), [setFile]);

  const handleDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
      setForceUpdate(false);
    },
    [setFile],
  );
  const handleDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 1) {
      showWarningMessage('Uploading multiple files at once is not currently supported!', 2000);
    }
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      multiple: false,
      onDropAccepted: handleDropAccepted,
      onDropRejected: handleDropRejected,
    });

  const classList = useMemo(() => {
    return classNames(
      'dropzone-base',
      isFocused || isDragActive ? 'dropzone-active' : undefined,
      isDragAccept ? 'dropzone-accept' : undefined,
      isDragReject ? 'dropzone-reject' : undefined,
    );
  }, [isFocused, isDragActive, isDragAccept, isDragReject]);

  const handleSwitchOnChange = useCallback(() => {
    if (!forceUpdate) {
      setPromptShown(true);
    } else {
      setForceUpdate(false);
    }
  }, [forceUpdate, setPromptShown, setForceUpdate]);

  const toggleButton = useMemo(
    () => (
      <div className="toggle-button-wrapper">
        <Switch checked={forceUpdate} onChange={handleSwitchOnChange} />
      </div>
    ),
    [forceUpdate, handleSwitchOnChange],
  );

  const handleConfirmForceUpdate = useCallback(() => {
    setForceUpdate(true);
    setPromptShown(false);
  }, [setForceUpdate]);
  const handleCancelForceUpdate = useCallback(() => {
    setPromptShown(false);
  }, [setPromptShown]);

  const confirmationPrompt = useMemo(
    () => (
      <div className="dropzone-controls">
        <ControlButton
          label="Yes"
          icon={IconNames.CONFIRM}
          onClick={handleConfirmForceUpdate}
          options={{ variant: 'default', intent: Intent.DANGER }}
        />
        <ControlButton
          label="No"
          icon={IconNames.CROSS}
          onClick={handleCancelForceUpdate}
          options={{ variant: 'default' }}
        />
      </div>
    ),
    [handleCancelForceUpdate, handleConfirmForceUpdate],
  );

  return (
    <>
      <Card elevation={Elevation.TWO} interactive>
        <div {...getRootProps({ className: classList })}>
          <input {...getInputProps()} />
          <p>Drag and drop a file here, or click to select a file</p>
        </div>
      </Card>
      {file && (
        <Card className="dropzone-prompt" elevation={Elevation.TWO} interactive>
          <h3>{file?.name}</h3>
          {!isWarningShown && (
            <>
              <div className="dropzone-controls">
                <HTMLSelect
                  options={htmlSelectOptions}
                  onChange={e => setAssessmentConfigId(parseInt(e.target.value))}
                  value={assessmentConfigId}
                />
                <ControlButton
                  label="Confirm Upload"
                  icon={IconNames.UPLOAD}
                  onClick={handleConfirmUpload}
                  options={{ variant: 'default', intent: Intent.DANGER }}
                />
                <ControlButton
                  label="Cancel Upload"
                  icon={IconNames.DELETE}
                  onClick={handleCancelUpload}
                  options={{ variant: 'default' }}
                />
              </div>
              <div className="dropzone-controls">
                <p>Force update opened assessment</p>
                {toggleButton}
              </div>
            </>
          )}
          {isWarningShown && <p>Are you sure that you want to force update the assessment?</p>}
          {isWarningShown && confirmationPrompt}
        </Card>
      )}
    </>
  );
}

export default MaterialDropzone;
