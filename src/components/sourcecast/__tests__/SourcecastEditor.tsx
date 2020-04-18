import * as React from 'react';

import { shallow } from 'enzyme';

import SourcecastEditor, { ISourcecastEditorProps } from '../SourcecastEditor';
import { IPosition } from '../sourcecastShape';

const componentDidMountSpy = jest.fn();

jest
  .spyOn(SourcecastEditor.prototype, 'componentDidMount')
  .mockImplementation(componentDidMountSpy);

test('SourcecastEditor renders correctly', () => {
  const props: ISourcecastEditorProps = {
    breakpoints: [],
    codeDeltasToApply: [],
    editorReadonly: false,
    editorSessionId: '',
    editorValue: '',
    highlightedLines: [],
    isEditorAutorun: false,
    inputToApply: null,
    isPlaying: false,
    isRecording: false,
    sharedbAceInitValue: '',
    sharedbAceIsInviting: false,
    getTimerDuration: () => 1,
    handleDeclarationNavigate: (cursorPosition: IPosition) => {},
    handleEditorEval: () => {},
    handleEditorValueChange: newCode => {},
    handleEditorUpdateBreakpoints: breakpoints => {},
    handleFinishInvite: () => {},
    handleRecordInput: input => {},
    handleSetWebsocketStatus: websocketStatus => {},
    handleUpdateHasUnsavedChanges: hasUnsavedChanges => {}
  };
  const app = <SourcecastEditor {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(componentDidMountSpy).toHaveBeenCalled();
});
