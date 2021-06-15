import 'ace-builds';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/ace';

import { shallow } from 'enzyme';
import lzString from 'lz-string';

import CodeSnippet from '../CodeSnippet';

describe('Sicp Code Snippet', () => {
  const body = '1+1;';
  const output = '2';
  const prependString = 'const a = 1;';
  const withoutPrepend = lzString.compressToEncodedURIComponent(body);
  const program = lzString.compressToEncodedURIComponent(prependString + '\n' + body);
  const prepend = lzString.compressToEncodedURIComponent(prependString);

  test('renders correctly', () => {
    const props = {
      body: body,
      output: output,
      id: 'id',
      initialEditorValueHash: withoutPrepend,
      initialPrependHash: prepend,
      initialFullProgramHash: program
    };

    const tree = shallow(<CodeSnippet {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });
});
