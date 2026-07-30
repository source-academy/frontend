import { render } from '@testing-library/react';
import lzString from 'lz-string';
import { CodeSnippetProvider } from 'src/features/sicp/CodeSnippetProvider';
import { describe, expect, test, vi } from 'vitest';

import CodeSnippet from './CodeSnippet';

// setupTests.ts imports flagConductorEnable, which pulls in src/commons/utils/Hooks
// before this file's imports run. Hooks.ts captures `useAppDispatch = useDispatch`
// as a one-time alias at module-load, so mocking 'react-redux' here is too late to
// affect it — mock the alias's own module instead.
vi.mock('src/commons/utils/Hooks', async importActual => ({
  ...(await importActual()),
  useAppDispatch: () => vi.fn(),
}));

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
