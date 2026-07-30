import { render, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SicpExercise from './SicpExercise';

// Mock the placeholder so this test stays focused on SicpExercise's own behaviour
// and is not coupled to the placeholder's wording/markup.
vi.mock('./NoSolutionPlaceholder', () => ({
  default: () => <span data-testid="no-solution-placeholder">no solution</span>,
}));

const solutionText = 'the solution';
const bodyText = 'the body';

const renderExercise = (overrideProps: Partial<React.ComponentProps<typeof SicpExercise>> = {}) =>
  render(
    <SicpExercise
      title="Exercise 1"
      body={<div>{bodyText}</div>}
      solution={<div>{solutionText}</div>}
      {...overrideProps}
    />,
  );

describe('SicpExercise', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  test('renders the title and body', () => {
    renderExercise();
    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText(bodyText)).toBeInTheDocument();
  });

  test('starts with the solution hidden and shows the toggle button', () => {
    renderExercise();
    expect(screen.getByRole('button', { name: /show solution/i })).toBeInTheDocument();
  });

  test('reveals the solution and flips the button label when clicked', async () => {
    renderExercise();
    await user.click(screen.getByRole('button', { name: /show solution/i }));
    expect(screen.getByText(solutionText)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide solution/i })).toBeInTheDocument();
  });

  test('toggles back to a closed state after a second click', async () => {
    renderExercise();
    await user.click(screen.getByRole('button', { name: /show solution/i }));
    await user.click(screen.getByRole('button', { name: /hide solution/i }));
    expect(screen.getByRole('button', { name: /show solution/i })).toBeInTheDocument();
  });

  test('falls back to the no-solution placeholder when no solution is provided', async () => {
    renderExercise({ solution: undefined });
    await user.click(screen.getByRole('button', { name: /show solution/i }));
    expect(screen.getByTestId('no-solution-placeholder')).toBeVisible();
    expect(screen.queryByText(solutionText)).not.toBeInTheDocument();
  });
});
