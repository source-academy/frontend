import type { ITabService } from '@sourceacademy/common-tabs';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  associateAutocompleteEvaluator,
  createAutocompleteModePublisher,
  normalizeAceModeId,
  useAutocompleteMode,
} from './autocompleteModeStore';

describe('autocomplete mode store', () => {
  test('normalizes bare and complete Ace mode IDs', () => {
    expect(normalizeAceModeId('python')).toBe('ace/mode/python');
    expect(normalizeAceModeId('ace/mode/python')).toBe('ace/mode/python');
  });

  test('updates React when an evaluator mode is published', () => {
    const evaluatorPath = '/evaluators/python.js';
    const tabService = {} as ITabService;
    associateAutocompleteEvaluator(tabService, evaluatorPath);
    const publisher = createAutocompleteModePublisher(tabService);
    const { result } = renderHook(() => useAutocompleteMode(evaluatorPath));

    expect(result.current).toBeNull();
    act(() => publisher.publish('python'));
    expect(result.current).toBe('ace/mode/python');
    act(() => publisher.dispose());
    expect(result.current).toBeNull();
  });

  test('does not let an older conductor clear a newer mode', () => {
    const evaluatorPath = '/evaluators/overlap.js';
    const olderTabService = {} as ITabService;
    const newerTabService = {} as ITabService;
    associateAutocompleteEvaluator(olderTabService, evaluatorPath);
    associateAutocompleteEvaluator(newerTabService, evaluatorPath);
    const older = createAutocompleteModePublisher(olderTabService);
    const newer = createAutocompleteModePublisher(newerTabService);
    const { result } = renderHook(() => useAutocompleteMode(evaluatorPath));

    act(() => older.publish('old-mode'));
    act(() => newer.publish('new-mode'));
    act(() => older.dispose());
    expect(result.current).toBe('ace/mode/new-mode');

    act(() => newer.dispose());
  });

  test('switches subscriptions when the selected evaluator changes', () => {
    const pythonTabService = {} as ITabService;
    const schemeTabService = {} as ITabService;
    associateAutocompleteEvaluator(pythonTabService, '/evaluators/python.js');
    associateAutocompleteEvaluator(schemeTabService, '/evaluators/scheme.js');
    const python = createAutocompleteModePublisher(pythonTabService);
    const scheme = createAutocompleteModePublisher(schemeTabService);
    const { result, rerender } = renderHook(
      ({ evaluatorPath }) => useAutocompleteMode(evaluatorPath),
      { initialProps: { evaluatorPath: '/evaluators/python.js' } },
    );

    act(() => python.publish('python'));
    expect(result.current).toBe('ace/mode/python');

    rerender({ evaluatorPath: '/evaluators/scheme.js' });
    expect(result.current).toBeNull();
    act(() => scheme.publish('scheme'));
    expect(result.current).toBe('ace/mode/scheme');

    act(() => {
      python.dispose();
      scheme.dispose();
    });
  });
});
