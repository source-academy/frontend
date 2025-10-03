import { Chapter, Variant } from 'js-slang/dist/langs';
import { describe, expect, it } from 'vitest';

import {
  ALL_LANGUAGES,
  getLanguageConfig,
  pyLanguages,
  schemeLanguages,
  sourceLanguages
} from '../ApplicationTypes';

describe(getLanguageConfig, () => {
  it('works for existing variants', () => {
    for (const language of ALL_LANGUAGES) {
      expect(getLanguageConfig(language.chapter, language.variant)).toEqual(language);
    }
  });

  it('throws an error for an invalid chapter/variant combination', () => {
    expect(() => getLanguageConfig(5 as Chapter, Variant.DEFAULT)).toThrowErrorMatchingSnapshot();
  });
});

describe('available Source language configurations', () => {
  it('matches expected configurations', () => {
    const expectedSourceConfigs = [
      // Source 1
      { chapter: Chapter.SOURCE_1, variant: Variant.DEFAULT, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_1, variant: Variant.TYPED, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_1, variant: Variant.WASM },
      { chapter: Chapter.SOURCE_1, variant: Variant.NATIVE, supports: { substVisualizer: true } },
      // Source 2
      {
        chapter: Chapter.SOURCE_2,
        variant: Variant.DEFAULT,
        supports: { dataVisualizer: true, substVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_2,
        variant: Variant.TYPED,
        supports: { dataVisualizer: true, substVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_2,
        variant: Variant.NATIVE,
        supports: { dataVisualizer: true, substVisualizer: true }
      },
      // Source 3
      {
        chapter: Chapter.SOURCE_3,
        variant: Variant.DEFAULT,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      {
        chapter: Chapter.SOURCE_3,
        variant: Variant.TYPED,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      {
        chapter: Chapter.SOURCE_3,
        variant: Variant.NATIVE,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      // Source 4
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.DEFAULT,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.TYPED,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.NATIVE,
        supports: { dataVisualizer: true, cseMachine: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.EXPLICIT_CONTROL,
        supports: { dataVisualizer: true, cseMachine: true }
      }
    ];

    expect(sourceLanguages).toMatchObject(expectedSourceConfigs);
  });

  it('matches snapshot', () => {
    expect(sourceLanguages).toMatchSnapshot();
  });
});

describe('available Python language configurations', () => {
  it('matches snapshot', () => {
    expect(pyLanguages).toMatchSnapshot();
  });
});

describe('available Scheme language configurations', () => {
  it('matches snapshot', () => {
    expect(schemeLanguages).toMatchSnapshot();
  });
});
