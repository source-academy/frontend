import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import {
  defaultWorkspaceSettings,
  WorkspaceSettingsContext,
} from 'src/commons/WorkspaceSettingsContext';
import { flagMonacoEditorEnable } from 'src/features/monaco/flagMonacoEditorEnable';
import { expect, test, vi } from 'vitest';

import EditorContainer, { type EditorContainerProps } from './EditorContainer';

vi.mock('./MonacoEditor', () => ({
  default: (props: any) => (
    <textarea
      data-testid="MonacoEditorMock"
      onChange={event => props.handleEditorValueChange(props.editorTabIndex, event.target.value)}
      readOnly={props.sessionDetails?.readOnly ?? false}
      value={props.editorValue}
    />
  ),
}));

const createProps = (overrides: Partial<EditorContainerProps> = {}): EditorContainerProps => ({
  activeEditorTabIndex: 0,
  editorSessionId: '',
  editorTabs: [
    {
      breakpoints: [],
      editorTabIndex: 0,
      editorValue: 'const x = 1;',
      filePath: '/program.js',
      highlightedLines: [],
    },
  ],
  editorVariant: 'normal',
  handleDeclarationNavigate: () => {},
  handleEditorEval: () => {},
  handleEditorUpdateBreakpoints: () => {},
  handleEditorValueChange: () => {},
  handlePromptAutocomplete: () => {},
  isEditorAutorun: false,
  isFolderModeEnabled: false,
  removeEditorTabByIndex: () => {},
  sessionDetails: null,
  setActiveEditorTabIndex: () => {},
  ...overrides,
});

const renderEditorContainer = (
  props: EditorContainerProps,
  featureFlags: Record<string, any> = {},
) => {
  const store = mockInitialStore({
    featureFlags: {
      modifiedFlags: featureFlags,
    },
  });

  return render(
    <Provider store={store}>
      <WorkspaceSettingsContext.Provider value={[defaultWorkspaceSettings, () => {}]}>
        <EditorContainer {...props} />
      </WorkspaceSettingsContext.Provider>
    </Provider>,
  );
};

test('EditorContainer renders Ace editor path when Monaco flag is off', () => {
  renderEditorContainer(createProps());
  expect(screen.getByTestId('Editor')).toBeTruthy();
  expect(screen.queryByTestId('MonacoEditorMock')).toBeNull();
});

test('EditorContainer renders Monaco editor path when Monaco flag is on', async () => {
  renderEditorContainer(createProps(), {
    [flagMonacoEditorEnable.flagName]: true,
  });
  expect(await screen.findByTestId('MonacoEditorMock')).toBeTruthy();
});

test('Monaco editor path forwards value changes with the active editor tab index', async () => {
  const handleEditorValueChange = vi.fn();
  renderEditorContainer(
    createProps({
      handleEditorValueChange,
    }),
    {
      [flagMonacoEditorEnable.flagName]: true,
    },
  );

  fireEvent.change(await screen.findByTestId('MonacoEditorMock'), {
    target: { value: 'const y = 2;' },
  });

  expect(handleEditorValueChange).toHaveBeenCalledWith(0, 'const y = 2;');
});
