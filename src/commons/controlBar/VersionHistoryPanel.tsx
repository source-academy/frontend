import {
  Button,
  Classes,
  Drawer,
  EditableText,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

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
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || versions.length === 0) {
      setSelectedVersionId(null);
      return;
    }
    const sorted = [...versions].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    const stillValid = sorted.some(v => v.id === selectedVersionId);
    if (!stillValid) {
      setSelectedVersionId(sorted[0].id);
    }
  }, [versions, isOpen]);

  const handleRestore = useCallback(
    (versionId: string) => {
      onRestore(versionId);
      onClose();
    },
    [onRestore, onClose]
  );

  const renderVersionItem = (version: CodeVersion) => (
    <div
      key={version.id}
      className={classNames('version-history-item', {
        'version-history-item--selected': version.id === selectedVersionId
      })}
      onClick={() => setSelectedVersionId(version.id)}
    >
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
    </div>
  );

  const renderPreviewPane = (version: CodeVersion | undefined) => {
    if (!version) {
      return (
        <NonIdealState description="Select a version to preview its code." icon={IconNames.CODE} />
      );
    }
    return (
      <div className="version-history-preview-content">
        <div className="version-history-preview-header">
          <span className="version-history-preview-title">
            {version.name || formatTimestamp(version.timestamp)}
          </span>
          <Button
            icon={IconNames.UNDO}
            intent={Intent.PRIMARY}
            text="Restore this version"
            onClick={() => handleRestore(version.id)}
          />
        </div>
        <pre className="version-history-preview-code">{version.code}</pre>
      </div>
    );
  };

  const sortedVersions = [...versions].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  const selectedVersion = versions.find(v => v.id === selectedVersionId);

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
    <div className="version-history-body">
      <div className="version-history-list">{sortedVersions.map(renderVersionItem)}</div>
      <div className="version-history-preview">{renderPreviewPane(selectedVersion)}</div>
    </div>
  );

  return (
    <Drawer
      className={classNames('version-history-drawer', Classes.DARK)}
      icon={IconNames.HISTORY}
      isCloseButtonShown={true}
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
      position="right"
      size="660px"
    >
      {content}
    </Drawer>
  );
};
