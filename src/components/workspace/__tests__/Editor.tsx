import * as React from 'react';

import { shallow } from 'enzyme';

import Editor, { IEditorProps } from '../Editor';

const componentDidMountSpy = jest.fn();

jest.spyOn(Editor.prototype, 'componentDidMount').mockImplementation(componentDidMountSpy);

test('Editor renders correctly', () => {
  const props: IEditorProps = {
    editorValue: '',
    handleEditorEval: () => {},
    handleEditorValueChange: newCode => {}
  };
  const app = <Editor {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(componentDidMountSpy).toHaveBeenCalled();
});
