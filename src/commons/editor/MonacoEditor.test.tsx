import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import type { EditorProps } from './Editor';
import MonacoEditor from './MonacoEditor';

const monacoReactMock = vi.hoisted(() => ({
  addCommand: vi.fn(),
  monaco: {
    KeyCode: {
      Enter: 3,
    },
    KeyMod: {
      Shift: 1024,
    },
  },
}));

vi.mock('monaco-editor', () => ({
  editor: {
    defineTheme: vi.fn(),
  },
}));

vi.mock('@monaco-editor/react', () => ({
  default: (props: any) => {
    props.onMount?.({ addCommand: monacoReactMock.addCommand }, monacoReactMock.monaco);

    return (
      <textarea
        data-theme={props.theme}
        data-testid="MonacoReactEditorMock"
        onChange={event => props.onChange(event.target.value, { source: 'test' })}
        readOnly={props.options?.readOnly ?? false}
        value={props.value}
      />
    );
  },
  loader: {
    config: vi.fn(),
  },
}));

beforeEach(() => {
  monacoReactMock.addCommand.mockClear();
});

const createProps = (overrides: Partial<EditorProps> = {}): EditorProps => ({
  breakpoints: [],
  editorSessionId: '',
  editorTabIndex: 0,
  editorValue: 'const x = 1;',
  handleDeclarationNavigate: () => {},
  handleEditorEval: () => {},
  handleEditorUpdateBreakpoints: () => {},
  handleEditorValueChange: () => {},
  handlePromptAutocomplete: () => {},
  highlightedLines: [],
  sessionDetails: null,
  ...overrides,
});

test('MonacoEditor renders the Monaco React editor wrapper', () => {
  render(<MonacoEditor {...createProps()} />);
  const editor = screen.getByTestId('MonacoReactEditorMock') as HTMLTextAreaElement;
  expect(screen.getByTestId('Editor')).toBeTruthy();
  expect(editor.value).toBe('const x = 1;');
  expect(editor.dataset.theme).toBe('source');
});

test('MonacoEditor forwards changes to workspace handlers', () => {
  const handleEditorValueChange = vi.fn();
  const handleUpdateHasUnsavedChanges = vi.fn();
  const onChange = vi.fn();

  render(
    <MonacoEditor
      {...createProps({
        handleEditorValueChange,
        handleUpdateHasUnsavedChanges,
        onChange,
      })}
    />,
  );

  fireEvent.change(screen.getByTestId('MonacoReactEditorMock'), {
    target: { value: 'const y = 2;' },
  });

  expect(handleEditorValueChange).toHaveBeenCalledWith(0, 'const y = 2;');
  expect(handleUpdateHasUnsavedChanges).toHaveBeenCalledWith(true);
  expect(onChange).toHaveBeenCalledWith('const y = 2;', { source: 'test' });
});

test('MonacoEditor passes session readonly state to Monaco', () => {
  render(
    <MonacoEditor
      {...createProps({
        sessionDetails: {
          docId: 'doc-id',
          owner: false,
          readOnly: true,
        },
      })}
    />,
  );

  expect(screen.getByTestId('MonacoReactEditorMock').hasAttribute('readonly')).toBe(true);
});

test('MonacoEditor registers Shift-Enter to evaluate the editor', () => {
  const handleEditorEval = vi.fn();

  render(<MonacoEditor {...createProps({ handleEditorEval })} />);

  expect(monacoReactMock.addCommand).toHaveBeenCalledWith(
    monacoReactMock.monaco.KeyMod.Shift | monacoReactMock.monaco.KeyCode.Enter,
    expect.any(Function),
  );

  monacoReactMock.addCommand.mock.calls[0][1]();

  expect(handleEditorEval).toHaveBeenCalledTimes(1);
});
