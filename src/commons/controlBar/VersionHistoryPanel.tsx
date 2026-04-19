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

// Versions within this window of each other are grouped into one change set.
const GROUP_THRESHOLD_MS = 15 * 60 * 1000;

type VersionGroup = {
  /** ID of the newest version in the group is used as a group key. */
  id: string;
  versions: CodeVersionMetadata[];
};

const formatTimestamp = (timestamp: number | null | undefined): string => {
  if (timestamp == null) return 'Unknown date';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
};

const groupVersions = (sortedNewestFirst: CodeVersionMetadata[]): VersionGroup[] => {
  if (sortedNewestFirst.length === 0) return [];
  const groups: VersionGroup[] = [];
  let current: CodeVersionMetadata[] = [sortedNewestFirst[0]];

  for (let i = 1; i < sortedNewestFirst.length; i++) {
    const prev = sortedNewestFirst[i - 1];
    const curr = sortedNewestFirst[i];
    if (prev.timestamp - curr.timestamp <= GROUP_THRESHOLD_MS) {
      current.push(curr);
    } else {
      groups.push({ id: current[0].id, versions: current });
      current = [curr];
    }
  }
  groups.push({ id: current[0].id, versions: current });
  return groups;
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
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => b.timestamp - a.timestamp),
    [versions]
  );
  const groups = useMemo(() => groupVersions(sortedVersions), [sortedVersions]);

  // Track expanded groups by id
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || sortedVersions.length === 0) return;
    onSelectVersion(sortedVersions[0]);
  }, [isOpen, sortedVersions]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleRestore = useCallback(() => {
    if (!selectedVersion || !selectedVersionCode) return;
    const version: CodeVersion = { ...selectedVersion, code: selectedVersionCode };
    onRestore(version);
    onClose();
  }, [selectedVersion, selectedVersionCode, onRestore, onClose]);

  const renderVersionItem = (version: CodeVersionMetadata, nested = false) => (
    <div
      key={version.id}
      role="button"
      tabIndex={0}
      aria-pressed={version.id === selectedVersion?.id}
      className={classNames('version-history-item', {
        'version-history-item--selected': version.id === selectedVersion?.id,
        'version-history-item--nested': nested
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

  const renderGroup = (group: VersionGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const newestVersion = group.versions[0];
    const label = newestVersion.name || formatTimestamp(newestVersion.timestamp);
    const hasMultiple = group.versions.length > 1;

    if (!hasMultiple) {
      return (
        <div key={group.id} className="version-history-group">
          {renderVersionItem(newestVersion, false)}
        </div>
      );
    }

    return (
      <div key={group.id} className="version-history-group">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          className={classNames('version-history-group-header', {
            'version-history-group-header--expanded': isExpanded,
            'version-history-group-header--contains-selected': group.versions.some(
              v => v.id === selectedVersion?.id
            )
          })}
          onClick={() => toggleGroup(group.id)}
          onKeyDown={e => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              toggleGroup(group.id);
            }
          }}
        >
          <div className="version-history-group-header-info">
            <div
              className="version-history-group-label"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
            >
              <EditableText
                key={newestVersion.name ?? newestVersion.id}
                defaultValue={label}
                placeholder={formatTimestamp(newestVersion.timestamp)}
                onConfirm={(value: string) => onRename(newestVersion.id, value)}
                selectAllOnFocus
              />
            </div>
            <span className="version-history-group-count">{group.versions.length} versions</span>
          </div>
          <span
            className={classNames('version-history-group-chevron', {
              'version-history-group-chevron--open': isExpanded
            })}
          >
            ›
          </span>
        </div>

        {isExpanded && (
          <div className="version-history-group-body">
            {group.versions.map(v => renderVersionItem(v, true))}
          </div>
        )}
      </div>
    );
  };

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
      <div className="version-history-list">{groups.map(g => renderGroup(g))}</div>
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
