import { shallow } from 'enzyme';
import { WorkspaceSettings, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';

import Editor, { EditorProps } from '../Editor';
import { Position } from '../EditorTypes';

test('Editor renders correctly', () => {
  const props: EditorProps = {
    breakpoints: [],
    editorSessionId: '',
    editorValue: '',
    highlightedLines: [],
    isEditorAutorun: false,
    handleDeclarationNavigate: (cursorPosition: Position) => {},
    handleEditorEval: () => {},
    handleEditorValueChange: newCode => {},
    handleEditorUpdateBreakpoints: breakpoints => {},
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
