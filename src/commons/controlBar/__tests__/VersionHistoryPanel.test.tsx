import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { VersionHistoryPanel } from '../VersionHistoryPanel';

vi.mock('../AceDiffViewer', () => ({
  default: () => <div data-testid="ace-diff-viewer" />
}));

const mockVersions = [
  { id: 'v1', timestamp: 1000000000000, name: 'Version 1' },
  { id: 'v2', timestamp: 1000000001000, name: 'Version 2' }
];

const defaultProps = {
  versions: mockVersions,
  currentCode: 'const x = 3;',
  isOpen: true,
  isLoading: false,
  selectedVersion: mockVersions[1],
  selectedVersionCode: 'const x = 2;',
  isLoadingCode: false,
  onClose: vi.fn(),
  onSelectVersion: vi.fn(),
  onRestore: vi.fn(),
  onRename: vi.fn()
};

test('renders loading state when isLoading is true', () => {
  render(<VersionHistoryPanel {...defaultProps} isLoading={true} />);
  expect(screen.getByText('Loading version history...')).toBeDefined();
});

test('renders empty state when no versions', () => {
  render(<VersionHistoryPanel {...defaultProps} versions={[]} />);
  expect(screen.getByText(/No versions found/)).toBeDefined();
});

test('renders version list items', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  // Version names appear in both the list and the preview header
  expect(screen.getAllByText('Version 1').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Version 2').length).toBeGreaterThan(0);
});

test('renders restore button for selected version', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  expect(screen.getByText('Restore this version')).toBeDefined();
});

test('calls onRestore and onClose when restore button clicked', () => {
  const onRestore = vi.fn();
  const onClose = vi.fn();
  render(<VersionHistoryPanel {...defaultProps} onRestore={onRestore} onClose={onClose} />);

  fireEvent.click(screen.getByText('Restore this version'));

  expect(onRestore).toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});

test('renders diff viewer for selected version', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  expect(screen.getByTestId('ace-diff-viewer')).toBeDefined();
});
