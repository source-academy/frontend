import {
  Dialog,
  DialogBody,
  FormGroup,
  HTMLSelect,
  Icon,
  PopoverPosition,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';

import { EditorBinding, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import LocaleSelector from './LocaleSelector';

const options = [
  { label: 'None', value: EditorBinding.NONE },
  { label: 'Vim', value: EditorBinding.VIM },
  { label: 'Emacs', value: EditorBinding.EMACS }
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownSettings: React.FC<Props> = ({ isOpen, onClose }) => {
  const [workspaceSettings, setWorkspaceSettings] = useContext(WorkspaceSettingsContext)!;

  const handleEditorBindingChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    setWorkspaceSettings({
      ...workspaceSettings,
      // Typecast to EditorBinding here is ok since the HTMLSelect only contains 'EditorBinding' options
      editorBinding: e.target.value as EditorBinding
    });
  };

  return (
    <Dialog
      className="settings"
      icon={IconNames.COG}
      isCloseButtonShown
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
    >
      <DialogBody>
        <FormGroup label="Editor Binding: " labelFor="editor-binding" inline>
          <HTMLSelect
            id="editor-binding"
            options={options}
            value={workspaceSettings.editorBinding}
            onChange={handleEditorBindingChange}
          />
          <Tooltip
            position={PopoverPosition.TOP}
            className="form-field-help-text"
            content="Optional editor bindings for advanced users. Set to 'None' for default text editor behaviour."
          >
            <Icon icon={IconNames.Help} />
          </Tooltip>
        </FormGroup>
        <LocaleSelector />
      </DialogBody>
    </Dialog>
  );
};

export default DropdownSettings;
