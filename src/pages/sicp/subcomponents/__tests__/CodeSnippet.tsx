import 'ace-builds';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ace';

import { shallow } from 'enzyme';
import lzString from 'lz-string';

import CodeSnippet from '../CodeSnippet';

describe('Sicp Code Snippet', () => {
  const body = 'const a = 1;\na+1;';
  const output = '2';
  const program = lzString.compressToEncodedURIComponent(body);

  test('renders correctly with prepend', () => {
    const props = {
      body: body,
      output: output,
      id: 'id',
      initialEditorValueHash: program,
      prependLength: 1
    };

    const tree = shallow(<CodeSnippet {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('renders correctly without prepend', () => {
    const props = {
      body: body,
      output: output,
      id: 'id',
      initialEditorValueHash: program,
      prependLength: 0
    };

    const tree = shallow(<CodeSnippet {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });
});
