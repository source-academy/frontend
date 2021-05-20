import { Intent } from '@blueprintjs/core';
import { mount, ReactWrapper } from 'enzyme';

import { PromptDialog, PromptDialogProps } from '../PromptDialog';

const CONTENTS = (
  <div>
    <div>Random</div>
    <p>content</p>
  </div>
);

const CHOICES: PromptDialogProps<string>['choices'] = [
  { key: 'choice1', label: 'Choice 1', intent: Intent.PRIMARY },
  { key: 'choice2', label: 'Choice 2' },
  { key: 'choice3', label: 'Choice 3' }
];

const RESPONSE_FN = jest.fn((...args) => console.log(args));

const VALUE = ' rpouiweytiogurtdsuiobgfh ';

const element = (
  <PromptDialog choices={CHOICES} onResponse={RESPONSE_FN} contents={CONTENTS} isOpen={true} />
);

const setInputValue = (mountedDialog: ReactWrapper, value: string) => {
  const inputs = mountedDialog.find('input');
  expect(inputs.length).toBe(1);
  const input = inputs.first().getDOMNode();
  (input as HTMLInputElement).value = value;
};

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

const makeEnterEvent = () =>
  new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true
  } as any);

test('shows content', () => {
  const dialog = mount(element);
  expect(dialog.contains(CONTENTS)).toBe(true);
});

test('shows buttons', () => {
  const dialog = mount(element);

  const buttons = dialog.find('button');

  expect(buttons.length).toBe(CHOICES.length);
  buttons.forEach(button =>
    expect(CHOICES.filter(choice => choice.label === button.text()).length).toBe(1)
  );
});

test('returns correctly on Esc if escapeResponse set', () => {
  const ESCAPE_RESPONSE = 'escaped';
  const dialog = mount(<PromptDialog {...element.props} escapeResponse={ESCAPE_RESPONSE} />);

  setInputValue(dialog, VALUE);

  RESPONSE_FN.mockReset();
  dialog.getDOMNode().dispatchEvent(makeEscapeEvent());
  expect(RESPONSE_FN).toBeCalledWith(ESCAPE_RESPONSE, VALUE);
});

test('does not return on Esc if escapeResponse not set', () => {
  const dialog = mount(element);

  RESPONSE_FN.mockReset();
  dialog.getDOMNode().dispatchEvent(makeEscapeEvent());
  expect(RESPONSE_FN).toHaveBeenCalledTimes(0);
});

test('returns correctly when button clicked', () => {
  const dialog = mount(element);

  const buttons = dialog.find('button');
  RESPONSE_FN.mockReset();
  buttons.forEach((button, index) => {
    const thisValue = VALUE + index;
    const choice = CHOICES.find(choice => choice.label === button.text());
    setInputValue(dialog, thisValue);
    button.getDOMNode().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(RESPONSE_FN).toBeCalledWith(choice?.key, thisValue);
  });
  expect(RESPONSE_FN).toHaveBeenCalledTimes(CHOICES.length);
});

test('returns correctly on Enter if enterResponse set', () => {
  const ENTER_RESPONSE = 'entered';
  const dialog = mount(<PromptDialog {...element.props} enterResponse={ENTER_RESPONSE} />);

  setInputValue(dialog, VALUE);

  RESPONSE_FN.mockReset();
  dialog.find('input').getDOMNode().dispatchEvent(makeEnterEvent());
  expect(RESPONSE_FN).toBeCalledWith(ENTER_RESPONSE, VALUE);
});

test('does not return on Enter if enterResponse not set', () => {
  const dialog = mount(element);

  RESPONSE_FN.mockReset();
  dialog.getDOMNode().dispatchEvent(makeEnterEvent());
  expect(RESPONSE_FN).toHaveBeenCalledTimes(0);
});
