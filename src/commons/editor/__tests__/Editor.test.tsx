import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTree } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import Editor, { type EditorProps } from '../Editor';
import type { Position } from '../EditorTypes';

test('Editor renders correctly', async () => {
  const props: EditorProps = {
    editorTabIndex: 0,
    breakpoints: [],
    editorSessionId: '',
    sessionDetails: null,
    editorValue: '',
    highlightedLines: [],
    isEditorAutorun: false,
    handleDeclarationNavigate: (cursorPosition: Position) => {},
    handleEditorEval: () => {},
    handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => {},
    handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => {},
    handleSetSharedbConnected: () => {},
    handleUpdateHasUnsavedChanges: hasUnsavedChanges => {},
    handlePromptAutocomplete: (row: number, col: number, callback: any) => {},
  };
  const Element: React.FC = () => (
    <Provider store={mockInitialStore()}>
      <Editor {...props} />
    </Provider>
  );
  const tree = await renderTree(<Element />);
  expect(tree).toMatchSnapshot();
});
