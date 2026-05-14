import { render } from '@testing-library/react';
import lzString from 'lz-string';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { describe, expect, test, vi } from 'vitest';

import CodeSnippet from '../CodeSnippet';

describe('Sicp Code Snippet', () => {
  vi.mock('react-redux', async importActual => ({
    ...(await importActual()),
    useDispatch: () => vi.fn(),
  }));

  const body = 'const a = 1;\na+1;';
  const output = '2';
  const program = lzString.compressToEncodedURIComponent(body);

  test('renders correctly with prepend', () => {
    const props = {
      body: body,
      output: output,
      id: 'id',
      initialEditorValueHash: program,
      prependLength: 1,
    };

    const tree = render(
      <CodeSnippetProvider>
        <CodeSnippet {...props} />
      </CodeSnippetProvider>,
    );
    expect(tree.asFragment()).toMatchSnapshot();
  });

  test('renders correctly without prepend', () => {
    const props = {
      body: body,
      output: output,
      id: 'id',
      initialEditorValueHash: program,
      prependLength: 0,
    };

    const tree = render(
      <CodeSnippetProvider>
        <CodeSnippet {...props} />
      </CodeSnippetProvider>,
    );
    expect(tree.asFragment()).toMatchSnapshot();
  });
});
