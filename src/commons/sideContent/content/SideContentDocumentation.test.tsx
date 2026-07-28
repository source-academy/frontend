import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import SideContentDocumentation from './SideContentDocumentation';

vi.mock('src/commons/documentation/Sicp', () => ({
  default: ({
    section,
    onNavigate,
  }: {
    section: string;
    onNavigate: (section: string) => void;
  }) => (
    <div>
      <span>SICP section: {section}</span>
      <button onClick={() => onNavigate('1.1')}>Open section</button>
    </div>
  ),
}));

test('documentation tabs preserve content and Home resets SICP', () => {
  render(<SideContentDocumentation />);

  expect(screen.getByTitle('Modules').hasAttribute('hidden')).toBe(false);
  fireEvent.click(screen.getByText('SICP JS'));
  fireEvent.click(screen.getByText('Open section'));
  expect(screen.getByText('SICP section: 1.1')).toBeTruthy();

  fireEvent.click(screen.getByText('Home'));
  expect(screen.getByText('SICP section: index')).toBeTruthy();
});
