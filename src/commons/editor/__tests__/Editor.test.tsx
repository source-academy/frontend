import { Provider } from 'react-redux';
import { renderTree } from 'src/commons/utils/TestUtils';
import { createStore } from 'src/pages/createStore';

import Editor, { EditorProps } from '../Editor';
import { Position } from '../EditorTypes';

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
    handlePromptAutocomplete: (row: number, col: number, callback: any) => {}
  };
  const Element: React.FC = () => (
    <Provider store={createStore()}>
      <Editor {...props} />
    </Provider>
  );
  const tree = await renderTree(<Element />);
  expect(tree).toMatchSnapshot();
});
