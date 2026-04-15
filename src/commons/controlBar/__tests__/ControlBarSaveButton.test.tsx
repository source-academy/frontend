import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ControlButtonSaveButton } from '../ControlBarSaveButton';

test('renders save button', () => {
  render(<ControlButtonSaveButton key="save" onClickSave={vi.fn()} />);
  expect(screen.getByText('Save')).toBeDefined();
});

test('renders save button with unsaved changes', () => {
  render(<ControlButtonSaveButton key="save" hasUnsavedChanges={true} onClickSave={vi.fn()} />);
  expect(screen.getByText('Save')).toBeDefined();
});

test('renders disabled save button', () => {
  render(<ControlButtonSaveButton key="save" isDisabled={true} onClickSave={vi.fn()} />);
  const button = screen.getByRole('button');
  expect(button).toBeDefined();
});
