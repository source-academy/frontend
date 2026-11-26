import { languages } from '@sourceacademy/language-directory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { act } from 'react';
import { Provider } from 'react-redux';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import { createStore } from 'src/pages/createStore';
import { queries } from 'src/queryKeys';
import { describe, expect, test, vi } from 'vitest';

import { useSicpJsSectionQuery, useSicPySectionQuery } from './useTextbookSectionQuery';

// A snippet that is shown, not run: the text is highlighted as the language of its textbook.
const section = [{ tag: 'SNIPPET', body: 'x = 1', eval: false }];

type Props = { hook: typeof useSicpJsSectionQuery };

function Section({ hook }: Props) {
  return <>{hook('1.1').data}</>;
}

function renderSection(hook: typeof useSicpJsSectionQuery, queryKey: readonly unknown[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(queryKey, section);
  const store = createStore();
  store.dispatch(LanguageDirectoryActions.setLanguages(languages));
  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Section hook={hook} />
      </Provider>
    </QueryClientProvider>,
  );
}

// The highlighter, to see which language it is told the code is in.
type HighlighterProps = { language?: string; children?: React.ReactNode };
vi.mock('react-syntax-highlighter', () => {
  function PrismLight({ language, children }: HighlighterProps) {
    return <pre data-language={language ?? ''}>{children}</pre>;
  }
  return { PrismLight };
});

describe('the code of a section of a textbook', () => {
  test('is highlighted as the language of the textbook that the directory gives (SICP JS)', () => {
    const { container } = renderSection(
      useSicpJsSectionQuery,
      queries.sicp.sectionJs('1.1').queryKey,
    );
    expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('javascript');
  });

  test('is highlighted as the language of the textbook that the directory gives (SICPy)', () => {
    const { container } = renderSection(
      useSicPySectionQuery,
      queries.sicp.sectionPy('1.1').queryKey,
    );
    expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('python');
  });

  test('is shown plain while the directory is not loaded', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(queries.sicp.sectionPy('1.1').queryKey, section);
    const store = createStore();
    store.dispatch(LanguageDirectoryActions.setLanguages([]));
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Section hook={useSicPySectionQuery} />
        </Provider>
      </QueryClientProvider>,
    );
    expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('');
  });

  test('gains its highlighting when the directory arrives, without fetching the section again', async () => {
    const fetchMock = vi.fn((_url: unknown) => Promise.reject(new Error('offline')));
    const sectionFetches = () =>
      fetchMock.mock.calls.filter(([url]) => String(url).includes('1.1')).length;
    vi.stubGlobal('fetch', fetchMock);
    try {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      queryClient.setQueryData(queries.sicp.sectionPy('1.1').queryKey, section);
      const store = createStore();
      store.dispatch(LanguageDirectoryActions.setLanguages([]));
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <Section hook={useSicPySectionQuery} />
          </Provider>
        </QueryClientProvider>,
      );
      expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('');
      await act(async () => {});
      const fetchesBefore = sectionFetches();

      await act(async () => {
        store.dispatch(LanguageDirectoryActions.setLanguages(languages));
      });

      expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('python');
      expect(sectionFetches()).toBe(fetchesBefore);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
