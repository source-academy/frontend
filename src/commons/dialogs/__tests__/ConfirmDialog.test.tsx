import { Intent } from '@blueprintjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ConfirmDialog, ConfirmDialogProps } from '../ConfirmDialog';

const TEXT1 = 'Random';
const TEXT2 = 'content';
const CONTENTS = (
  <div>
    <div>{TEXT1}</div>
    <p>{TEXT2}</p>
  </div>
);

const CHOICES: ConfirmDialogProps<string>['choices'] = [
  { key: 'choice1', label: 'Choice 1', intent: Intent.PRIMARY },
  { key: 'choice2', label: 'Choice 2' },
  { key: 'choice3', label: 'Choice 3' }
];

const RESPONSE_FN = vi.fn((...args) => console.log(args));

const element = (
  <ConfirmDialog choices={CHOICES} onResponse={RESPONSE_FN} contents={CONTENTS} isOpen={true} />
);

const makeEscapeEvent = () =>
  // There's no good way to create a KeyboardEvent without manually specifying
  // all the different properties -_-
  new KeyboardEvent(
    'keydown',
    {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    } as any /* keyCode is deprecated so missing from the TS DOM typedefs but JSDOM and Blueprint3 use keyCode... */
  );

test('shows content', () => {
  render(element);
  screen.getByText(TEXT1);
  screen.getByText(TEXT2);
});

test('shows buttons', () => {
  render(element);
  const buttons = screen.getAllByRole('button');

  expect(buttons.length).toBe(CHOICES.length);
  buttons.forEach(button =>
    expect(CHOICES.filter(choice => choice.label === button.textContent).length).toBe(1)
  );
});

test('returns correctly on Esc if escapeResponse set', () => {
  const ESCAPE_RESPONSE = 'escaped';
  const dialog = render(<ConfirmDialog {...element.props} escapeResponse={ESCAPE_RESPONSE} />);

  RESPONSE_FN.mockReset();
  fireEvent(dialog.getByRole('dialog'), makeEscapeEvent());
  expect(RESPONSE_FN).toBeCalledWith(ESCAPE_RESPONSE);
});

test('does not return on Esc if escapeResponse not set', () => {
  const dialog = render(element);

  RESPONSE_FN.mockReset();
  fireEvent(dialog.getByRole('dialog'), makeEscapeEvent());
  expect(RESPONSE_FN).toHaveBeenCalledTimes(0);
});

test('returns correctly when button clicked', () => {
  const dialog = render(element);
  const buttons = dialog.getAllByRole('button');

  RESPONSE_FN.mockReset();
  buttons.forEach(button => {
    const choice = CHOICES.find(choice => choice.label === button.textContent);
    fireEvent(button, new MouseEvent('click', { bubbles: true }));
    expect(RESPONSE_FN).toBeCalledWith(choice?.key);
  });
  expect(RESPONSE_FN).toHaveBeenCalledTimes(CHOICES.length);
});
