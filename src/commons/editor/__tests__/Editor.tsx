import { shallow } from 'enzyme';
import * as React from 'react';

import Editor, { EditorProps } from '../Editor';
import { Position } from '../EditorTypes';

test('Editor renders correctly', () => {
  const props: EditorProps = {
    breakpoints: [],
    editorSessionId: '',
    editorValue: '',
    highlightedLines: [],
    isEditorAutorun: false,
    sharedbAceInitValue: '',
    sharedbAceIsInviting: false,
    handleDeclarationNavigate: (cursorPosition: Position) => {},
    handleEditorEval: () => {},
    handleEditorValueChange: newCode => {},
    handleEditorUpdateBreakpoints: breakpoints => {},
    handleFinishInvite: () => {},
    handleSetWebsocketStatus: websocketStatus => {},
    handleUpdateHasUnsavedChanges: hasUnsavedChanges => {},
    handlePromptAutocomplete: (row: number, col: number, callback: any) => {}
  };
  const app = <Editor {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
