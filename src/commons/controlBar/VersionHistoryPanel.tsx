import {
  Button,
  Dialog,
  DialogBody,
  EditableText,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback } from 'react';

import type { CodeVersion } from '../workspace/WorkspaceTypes';

type Props = {
  versions: CodeVersion[];
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onRestore: (versionId: string) => void;
  onRename: (versionId: string, name: string) => void;
};

const formatTimestamp = (timestamp: number | null | undefined): string => {
  if (timestamp == null) return 'Unknown date';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
};

export const VersionHistoryPanel: React.FC<Props> = ({
  versions,
  isOpen,
  isLoading,
  onClose,
  onRestore,
  onRename
}) => {
  const handleRestore = useCallback(
    (versionId: string) => {
      onRestore(versionId);
      onClose();
    },
    [onRestore, onClose]
  );

  const renderVersionItem = (version: CodeVersion) => (
    <div key={version.id} className="version-history-item">
      <div className="version-history-item-info">
        <EditableText
          className="version-history-item-name"
          defaultValue={version.name || formatTimestamp(version.timestamp)}
          placeholder={formatTimestamp(version.timestamp)}
          onConfirm={(value: string) => onRename(version.id, value)}
          selectAllOnFocus
        />
        <span className="version-history-item-timestamp">{formatTimestamp(version.timestamp)}</span>
      </div>
      <Button
        icon={IconNames.UNDO}
        intent={Intent.PRIMARY}
        minimal
        text="Restore"
        onClick={() => handleRestore(version.id)}
      />
    </div>
  );

  const content = isLoading ? (
    <NonIdealState
      description="Loading version history..."
      icon={<Spinner size={SpinnerSize.STANDARD} />}
    />
  ) : versions.length === 0 ? (
    <NonIdealState
      description="No versions found. Versions are saved automatically as you edit."
      icon={IconNames.HISTORY}
    />
  ) : (
    <div className="version-history-list">
      {[...versions].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).map(renderVersionItem)}
    </div>
  );

  return (
    <Dialog
      className="version-history-dialog"
      icon={IconNames.HISTORY}
      isCloseButtonShown={true}
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
    >
      <DialogBody>{content}</DialogBody>
    </Dialog>
  );
};
