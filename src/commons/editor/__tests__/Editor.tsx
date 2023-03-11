import { shallow } from 'enzyme';
import { WorkspaceSettings, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';

import Editor, { EditorProps } from '../Editor';
import { Position } from '../EditorTypes';

test('Editor renders correctly', () => {
  const props: EditorProps = {
    editorTabIndex: 0,
    breakpoints: [],
    editorSessionId: '',
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
  const app = (
    <WorkspaceSettingsContext.Provider value={[{} as WorkspaceSettings, jest.fn()]}>
      <Editor {...props} />
    </WorkspaceSettingsContext.Provider>
  );
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
