import { shallowRender } from 'src/commons/utils/TestUtils';

import Editor, { EditorProps } from '../Editor';
import { Position } from '../EditorTypes';

test('Editor renders correctly', () => {
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
  const Element: React.FC = () => <Editor {...props} />;
  const tree = shallowRender(<Element />);
  expect(tree).toMatchSnapshot();
});
