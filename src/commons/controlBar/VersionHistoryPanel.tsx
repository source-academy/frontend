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
import React, { useCallback, useEffect, useMemo } from 'react';

import type { CodeVersion, CodeVersionMetadata } from '../workspace/WorkspaceTypes';
import AceDiffViewer from './AceDiffViewer';

type Props = {
  versions: CodeVersionMetadata[];
  currentCode: string;
  isOpen: boolean;
  isLoading: boolean;
  selectedVersion: CodeVersionMetadata | null;
  selectedVersionCode: string | null;
  isLoadingCode: boolean;
  onClose: () => void;
  onSelectVersion: (version: CodeVersionMetadata) => void;
  onRestore: (version: CodeVersion) => void;
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
  selectedVersion,
  selectedVersionCode,
  isLoadingCode,
  onClose,
  onSelectVersion,
  onRestore,
  onRename
}) => {
  const sortedVersions = useMemo(() => [...versions].reverse(), [versions]);

  useEffect(() => {
    if (!isOpen || sortedVersions.length === 0) return;
    onSelectVersion(sortedVersions[0]);
  }, [isOpen, sortedVersions]);

  const handleRestore = useCallback(() => {
    if (!selectedVersion || !selectedVersionCode) return;
    const version: CodeVersion = { ...selectedVersion, code: selectedVersionCode };
    onRestore(version);
    onClose();
  }, [selectedVersion, selectedVersionCode, onRestore, onClose]);

  const renderVersionItem = (version: CodeVersionMetadata) => (
    <div
      key={version.id}
      role="button"
      tabIndex={0}
      aria-pressed={version.id === selectedVersion?.id}
      className={classNames('version-history-item', {
        'version-history-item--selected': version.id === selectedVersion?.id
      })}
      onClick={() => onSelectVersion(version)}
      onKeyDown={e => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelectVersion(version);
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

  const renderPreviewPane = () => {
    if (!selectedVersion) {
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
              {selectedVersion.name || formatTimestamp(selectedVersion.timestamp)}
            </span>
          </div>
          <Button
            icon={IconNames.UNDO}
            intent={Intent.PRIMARY}
            text="Restore this version"
            disabled={isLoadingCode || !selectedVersionCode}
            onClick={handleRestore}
          />
        </div>
        <div className="version-history-diff-container">
          {isLoadingCode ? (
            <NonIdealState
              description="Loading version code..."
              icon={<Spinner size={SpinnerSize.STANDARD} />}
            />
          ) : (
            <AceDiffViewer currentCode={currentCode} versionCode={selectedVersionCode ?? ''} />
          )}
        </div>
      </div>
    );
  };

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
      <div className="version-history-preview">{renderPreviewPane()}</div>
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
