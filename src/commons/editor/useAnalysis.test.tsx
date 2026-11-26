import type { ITabService } from '@sourceacademy/common-tabs';
import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'src/pages/createStore';
import { describe, expect, test } from 'vitest';

import {
  type AnalysisProvider,
  createAnalysisPublisher,
} from '../../features/conductor/analysisStore';
import { associateAutocompleteEvaluator } from '../../features/conductor/autocompleteModeStore';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import { useAnalysis } from './useAnalysis';

const language = {
  id: 'testlang',
  name: 'Test language',
  evaluators: [
    { id: 'testlangFirst', name: 'First', path: '/evaluators/first.js' },
    { id: 'testlangSecond', name: 'Second', path: '/evaluators/second.js' },
  ],
} as unknown as ILanguageDefinition;

const provider: AnalysisProvider = {
  capabilities: { occurrences: true, definition: true, scope: true },
  occurrences: async () => [],
  definition: async () => null,
  scope: async () => [],
};

function setUp() {
  const store = createStore();
  store.dispatch(LanguageDirectoryActions.setLanguages([language]));
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const publisherFor = (evaluatorPath: string) => {
    const tabService = {} as ITabService;
    associateAutocompleteEvaluator(tabService, evaluatorPath);
    return createAnalysisPublisher(tabService);
  };
  return { store, wrapper, publisherFor };
}

describe('useAnalysis', () => {
  test('is the analysis that the selected evaluator has published, and none before it has', () => {
    const { store, wrapper, publisherFor } = setUp();
    const publisher = publisherFor('/evaluators/first.js');
    act(() => {
      store.dispatch(LanguageDirectoryActions.setSelectedLanguage('testlang', 'testlangFirst'));
    });
    const { result } = renderHook(() => useAnalysis(), { wrapper });
    expect(result.current.current).toBeUndefined();

    act(() => publisher.publish(provider));
    expect(result.current.current).toBe(provider);

    act(() => publisher.dispose());
    expect(result.current.current).toBeUndefined();
  });

  test('follows the evaluator that is selected, not the one that has published', () => {
    const { store, wrapper, publisherFor } = setUp();
    const publisher = publisherFor('/evaluators/first.js');
    act(() => {
      store.dispatch(LanguageDirectoryActions.setSelectedLanguage('testlang', 'testlangSecond'));
    });
    const { result } = renderHook(() => useAnalysis(), { wrapper });

    act(() => publisher.publish(provider));
    expect(result.current.current).toBeUndefined();

    act(() => {
      store.dispatch(LanguageDirectoryActions.setSelectedEvaluator('testlangFirst'));
    });
    expect(result.current.current).toBe(provider);
    act(() => publisher.dispose());
  });

  test('is a ref that callbacks made once keep seeing the current analysis through', () => {
    const { store, wrapper, publisherFor } = setUp();
    const publisher = publisherFor('/evaluators/first.js');
    act(() => {
      store.dispatch(LanguageDirectoryActions.setSelectedLanguage('testlang', 'testlangFirst'));
    });
    const { result } = renderHook(() => useAnalysis(), { wrapper });
    const refFromTheFirstRender = result.current;

    act(() => publisher.publish(provider));

    expect(refFromTheFirstRender.current).toBe(provider);
    act(() => publisher.dispose());
  });

  test('is none where no language is selected', () => {
    const { store, wrapper } = setUp();
    act(() => {
      store.dispatch(LanguageDirectoryActions.clearSelectedLanguage());
    });
    const { result } = renderHook(() => useAnalysis(), { wrapper });
    expect(result.current.current).toBeUndefined();
  });
});
