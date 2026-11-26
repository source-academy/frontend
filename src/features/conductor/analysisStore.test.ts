import type { AnalysisCapabilities } from '@sourceacademy/common-autocomplete';
import type { ITabService } from '@sourceacademy/common-tabs';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  type AnalysisProvider,
  createAnalysisPublisher,
  useAnalysisProvider,
} from './analysisStore';
import { associateAutocompleteEvaluator } from './autocompleteModeStore';

const all: AnalysisCapabilities = { occurrences: true, definition: true, scope: true };
const provider = (capabilities: AnalysisCapabilities = all): AnalysisProvider => ({
  capabilities,
  occurrences: async () => [],
  definition: async () => null,
  scope: async () => [],
});

const publisherFor = (evaluatorPath: string) => {
  const tabService = {} as ITabService;
  associateAutocompleteEvaluator(tabService, evaluatorPath);
  return createAnalysisPublisher(tabService);
};

describe('analysis store', () => {
  test('there is no analysis until the evaluator has published one', () => {
    const { result } = renderHook(() => useAnalysisProvider('/evaluators/none.js'));
    expect(result.current).toBeUndefined();
  });

  test('there is none without an evaluator', () => {
    const { result } = renderHook(() => useAnalysisProvider(undefined));
    expect(result.current).toBeUndefined();
  });

  test('updates React when an evaluator publishes its analysis, and when it goes', () => {
    const evaluatorPath = '/evaluators/analysing.js';
    const publisher = publisherFor(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));

    const published = provider();
    act(() => publisher.publish(published));
    expect(result.current).toBe(published);

    act(() => publisher.dispose());
    expect(result.current).toBeUndefined();
  });

  test('follows an evaluator that says it provides fewer analyses', () => {
    const evaluatorPath = '/evaluators/fewer.js';
    const publisher = publisherFor(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));

    act(() => publisher.publish(provider()));
    const fewer = provider({ occurrences: true, definition: false, scope: false });
    act(() => publisher.publish(fewer));

    expect(result.current?.capabilities).toEqual({
      occurrences: true,
      definition: false,
      scope: false,
    });
    act(() => publisher.dispose());
  });

  test('is per evaluator', () => {
    const publisher = publisherFor('/evaluators/one.js');
    const { result } = renderHook(() => useAnalysisProvider('/evaluators/another.js'));
    act(() => publisher.publish(provider()));
    expect(result.current).toBeUndefined();
    act(() => publisher.dispose());
  });

  test('a publish after dispose does not bring the analysis back', () => {
    const evaluatorPath = '/evaluators/late-analysis.js';
    const publisher = publisherFor(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));

    act(() => publisher.dispose());
    act(() => publisher.publish(provider()));
    expect(result.current).toBeUndefined();
  });

  test('does not let an older conductor clear or overwrite a newer one’s analysis', () => {
    const evaluatorPath = '/evaluators/overlapping-analysis.js';
    const older = publisherFor(evaluatorPath);
    const newer = publisherFor(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));

    const newerProvider = provider();
    act(() => newer.publish(newerProvider));
    act(() => older.publish(provider({ occurrences: false, definition: false, scope: false })));
    act(() => older.dispose());

    expect(result.current).toBe(newerProvider);
    act(() => newer.dispose());
  });

  test('a tab service that no evaluator is associated with has no analysis to publish', () => {
    expect(() => createAnalysisPublisher({} as ITabService)).toThrow(/not associated/);
  });
});
