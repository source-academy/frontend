import { Colors, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  isFolderModeEnabled: boolean;
  isSessionActive: boolean;
  isPersistenceActive: boolean;
  toggleFolderMode: () => void;
  /** Whether the current language/evaluator supports folder mode at all —
   * from the Language Directory's `foldersEnabled` (defaults to `true` when
   * the field is omitted, so callers on languages predating this field are
   * unaffected). `false` for e.g. Python §1, which has no pair/list library
   * to build the exports-transfer structure local-file imports rely on. */
  foldersEnabled?: boolean;
};

function ControlBarToggleFolderModeButton({
  isFolderModeEnabled,
  isSessionActive,
  isPersistenceActive,
  toggleFolderMode,
  foldersEnabled = true,
}: Props) {
  const tooltipContent = !foldersEnabled
    ? 'Folder mode is not supported for this language'
    : isSessionActive
      ? 'Currently unsupported while a collaborative session is active'
      : isPersistenceActive
        ? 'Currently unsupported while a persistence method is active'
        : `${isFolderModeEnabled ? 'Disable' : 'Enable'} Folder mode`;
  return (
    <Tooltip content={tooltipContent}>
      <ControlButton
        label="Folder"
        icon={IconNames.FOLDER_CLOSE}
        options={{
          iconColor: isFolderModeEnabled ? Colors.BLUE4 : undefined,
        }}
        onClick={toggleFolderMode}
        isDisabled={!foldersEnabled || isSessionActive || isPersistenceActive}
      />
    </Tooltip>
  );
}

export default ControlBarToggleFolderModeButton;
