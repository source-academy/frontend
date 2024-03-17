import { Chapter, Variant } from 'js-slang/dist/types';

import {
  ALL_LANGUAGES,
  getLanguageConfig,
  pyLanguages,
  schemeLanguages,
  sourceLanguages
} from '../ApplicationTypes';

describe('getLanguageConfig', () => {
  test('works for existing variants', () => {
    for (const language of ALL_LANGUAGES) {
      expect(getLanguageConfig(language.chapter, language.variant)).toEqual(language);
    }
  });

  test('throws an error for an invalid chapter/variant combination', () => {
    expect(() => getLanguageConfig(5 as Chapter, Variant.DEFAULT)).toThrowErrorMatchingSnapshot();
  });
});

describe('available Source language configurations', () => {
  test('matches expected configurations', () => {
    const expectedSourceConfigs = [
      // Source 1
      { chapter: Chapter.SOURCE_1, variant: Variant.DEFAULT, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_1, variant: Variant.TYPED, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_1, variant: Variant.WASM },
      { chapter: Chapter.SOURCE_1, variant: Variant.LAZY },
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
      { chapter: Chapter.SOURCE_2, variant: Variant.LAZY, supports: { dataVisualizer: true } },
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
        variant: Variant.CONCURRENT,
        supports: { dataVisualizer: true }
      },
      { chapter: Chapter.SOURCE_3, variant: Variant.NON_DET, supports: { dataVisualizer: true } },
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
        variant: Variant.GPU,
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

  test('matches snapshot', () => {
    expect(sourceLanguages).toMatchSnapshot();
  });
});

describe('available Python language configurations', () => {
  test('matches snapshot', () => {
    expect(pyLanguages).toMatchSnapshot();
  });
});

describe('available Scheme language configurations', () => {
  test('matches snapshot', () => {
    expect(schemeLanguages).toMatchSnapshot();
  });
});
