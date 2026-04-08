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
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { CodeVersion } from '../workspace/WorkspaceTypes';
import AceDiffViewer from './AceDiffViewer';

type Props = {
  versions: CodeVersion[];
  currentCode: string;
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
  currentCode,
  isOpen,
  isLoading,
  onClose,
  onRestore,
  onRename
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const sortedVersions = useMemo(() => [...versions].reverse(), [versions]);

  useEffect(() => {
    if (!isOpen || sortedVersions.length === 0) {
      setSelectedVersionId(null);
      return;
    }
    setSelectedVersionId(prev => {
      const stillValid = sortedVersions.some(v => v.id === prev);
      return stillValid ? prev : sortedVersions[0].id;
    });
  }, [sortedVersions, isOpen]);

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
      role="button"
      tabIndex={0}
      aria-pressed={version.id === selectedVersionId}
      className={classNames('version-history-item', {
        'version-history-item--selected': version.id === selectedVersionId
      })}
      onClick={() => setSelectedVersionId(version.id)}
      onKeyDown={e => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setSelectedVersionId(version.id);
        }
      }}
    >
      <div className="version-history-item-info">
        <EditableText
          key={version.name ?? version.id}
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
          <div className="version-history-diff-labels">
            <span className="version-history-diff-label">Current</span>
            <span className="version-history-diff-label">
              {version.name || formatTimestamp(version.timestamp)}
            </span>
          </div>
          <Button
            icon={IconNames.UNDO}
            intent={Intent.PRIMARY}
            text="Restore this version"
            onClick={() => handleRestore(version.id)}
          />
        </div>
        <div className="version-history-diff-container">
          <AceDiffViewer currentCode={currentCode} versionCode={version.code} />
        </div>
      </div>
    );
  };

  const selectedVersion = sortedVersions.find(v => v.id === selectedVersionId);

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
      size="100%"
    >
      {content}
    </Drawer>
  );
};
