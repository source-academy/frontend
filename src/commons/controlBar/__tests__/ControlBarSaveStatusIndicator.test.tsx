import { render, screen } from '@testing-library/react';

import { ControlBarSaveStatusIndicator } from '../ControlBarSaveStatusIndicator';

test('renders null when status is idle', () => {
  const { container } = render(<ControlBarSaveStatusIndicator saveStatus="idle" />);
  expect(container.firstChild).toBeNull();
});

test('renders saving status', () => {
  render(<ControlBarSaveStatusIndicator saveStatus="saving" />);
  expect(screen.getByText('Saving')).toBeDefined();
});

test('renders saved status', () => {
  render(<ControlBarSaveStatusIndicator saveStatus="saved" />);
  expect(screen.getByText('Saved')).toBeDefined();
});

test('renders saveFailed status', () => {
  render(<ControlBarSaveStatusIndicator saveStatus="saveFailed" />);
  expect(screen.getByText('Saving failed')).toBeDefined();
});
