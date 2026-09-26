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

describe('Sicp Code Snippet Python highlighting (SICPy)', () => {
  // def/nonlocal have no JS equivalent, so they only look highlighted if the
  // snippet was actually tokenized as Python (not the hardcoded 'javascript' it
  // used to be — every SICPy snippet was highlighted as JS regardless of edition).
  const body = 'def f():\n    x = 1\n    def g():\n        nonlocal x\n        x = 2\n    return g';
  const program = lzString.compressToEncodedURIComponent(body);
  const props = {
    body,
    output: '',
    id: 'id-py',
    initialEditorValueHash: program,
    prependLength: 0,
    language: 'python' as const,
  };

  test('the <code> element is tagged as Python, not JavaScript', () => {
    const { container } = render(
      <CodeSnippetProvider>
        <CodeSnippet {...props} />
      </CodeSnippetProvider>,
    );
    const code = container.querySelector('code');
    expect(code?.className).toContain('language-python');
  });

  test('def and nonlocal are tokenized as keywords', () => {
    const { container } = render(
      <CodeSnippetProvider>
        <CodeSnippet {...props} />
      </CodeSnippetProvider>,
    );
    const code = container.querySelector('code');
    const defSpan = Array.from(code?.querySelectorAll('span') ?? []).find(
      s => s.textContent === 'def',
    );
    const nonlocalSpan = Array.from(code?.querySelectorAll('span') ?? []).find(
      s => s.textContent === 'nonlocal',
    );
    expect(defSpan?.className).toContain('token');
    expect(nonlocalSpan?.className).toContain('token');
  });
});
