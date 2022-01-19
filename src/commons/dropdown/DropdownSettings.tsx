import { Classes, Dialog, FormGroup, HTMLSelect, Icon, PopoverPosition } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useContext, useMemo } from 'react';

import { EditorBinding, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DropdownSettings: React.FC<DialogProps> = props => {
  const [workspaceSettings, setWorkspaceSettings] = useContext(WorkspaceSettingsContext)!;

  const options = useMemo(
    () => [
      {
        label: 'None',
        value: EditorBinding.NONE
      },
      {
        label: 'Vim',
        value: EditorBinding.VIM
      },
      {
        label: 'Emacs',
        value: EditorBinding.EMACS
      }
    ],
    []
  );

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
      isCloseButtonShown={true}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Settings"
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label="Editor Binding: " labelFor="editor-binding" inline>
          <HTMLSelect
            id="editor-binding"
            options={options}
            value={workspaceSettings.editorBinding}
            onChange={handleEditorBindingChange}
          />
          <Tooltip2
            position={PopoverPosition.TOP}
            className="form-field-help-text"
            content={
              "Optional editor bindings for advanced users. Set to 'None' for default text editor behaviour."
            }
          >
            <Icon icon="help" />
          </Tooltip2>
        </FormGroup>
      </div>
    </Dialog>
  );
};

export default DropdownSettings;
