import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EditorProps } from '../Editor';
import MonacoEditor from '../MonacoEditor';

vi.mock('monaco-editor', () => ({
  editor: {
    defineTheme: vi.fn()
  }
}));

vi.mock('@monaco-editor/react', () => ({
  default: (props: any) => (
    <textarea
      data-theme={props.theme}
      data-testid="MonacoReactEditorMock"
      onChange={event => props.onChange(event.target.value, { source: 'test' })}
      readOnly={props.options?.readOnly ?? false}
      value={props.value}
    />
  ),
  loader: {
    config: vi.fn()
  }
}));

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
  isEditorAutorun: false,
  sessionDetails: null,
  ...overrides
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
        onChange
      })}
    />
  );

  fireEvent.change(screen.getByTestId('MonacoReactEditorMock'), {
    target: { value: 'const y = 2;' }
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
          readOnly: true
        }
      })}
    />
  );

  expect(screen.getByTestId('MonacoReactEditorMock').hasAttribute('readonly')).toBe(true);
});
