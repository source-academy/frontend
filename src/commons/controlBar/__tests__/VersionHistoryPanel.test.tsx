import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { VersionHistoryPanel } from '../VersionHistoryPanel';

vi.mock('../AceDiffViewer', () => ({
  default: () => <div data-testid="ace-diff-viewer" />
}));

const MINUTE = 60 * 1000;

// Two versions close together (same group), one far apart (separate group)
const mockVersions = [
  { id: 'v3', timestamp: 1000000001000 + 20 * MINUTE, name: 'Version 3' },
  { id: 'v2', timestamp: 1000000001000, name: 'Version 2' },
  { id: 'v1', timestamp: 1000000000000, name: 'Version 1' }
];

const defaultProps = {
  versions: mockVersions,
  currentCode: 'const x = 3;',
  isOpen: true,
  isLoading: false,
  selectedVersion: mockVersions[2],
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

test('groups versions within 5 minutes together', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  // v3 is 10 min apart — separate group; v1 and v2 are 1s apart — same group
  expect(screen.getByText('2 versions')).toBeDefined();
});

test('single-version group renders without a dropdown header', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  // v3 is its own group — no group header, so no aria-expanded on a v3 button
  expect(screen.getAllByText('Version 3').length).toBeGreaterThan(0);
  const expandButtons = screen.queryAllByRole('button', { expanded: false });
  // Only the v1/v2 multi-version group should have aria-expanded; v3 has none
  expect(expandButtons.every(btn => !btn.textContent?.includes('Version 3'))).toBe(true);
});

test('clicking a multi-version group header expands it', () => {
  render(<VersionHistoryPanel {...defaultProps} />);
  // The v1/v2 group header is collapsed; clicking should expand it
  const groupHeader = screen.getByRole('button', { name: /2 versions/i });
  // Before click, nested items hidden (aria-expanded false)
  expect(groupHeader.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(groupHeader);
  expect(groupHeader.getAttribute('aria-expanded')).toBe('true');
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
