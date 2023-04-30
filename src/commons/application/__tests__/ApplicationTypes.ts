import { Chapter, Variant } from 'js-slang/dist/types';

import { sourceLanguages } from '../ApplicationTypes';

describe('available Source language configurations', () => {
  test('matches expected configurations', () => {
    const expectedSourceConfigs = [
      // Source 1
      { chapter: Chapter.SOURCE_1, variant: Variant.DEFAULT, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_1, variant: Variant.TYPED },
      { chapter: Chapter.SOURCE_1, variant: Variant.WASM },
      { chapter: Chapter.SOURCE_1, variant: Variant.LAZY },
      { chapter: Chapter.SOURCE_1, variant: Variant.NATIVE, supports: { substVisualizer: true } },
      // Source 2
      {
        chapter: Chapter.SOURCE_2,
        variant: Variant.DEFAULT,
        supports: { dataVisualizer: true, substVisualizer: true }
      },
      { chapter: Chapter.SOURCE_2, variant: Variant.TYPED, supports: { dataVisualizer: true } },
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
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_3,
        variant: Variant.TYPED,
        supports: { dataVisualizer: true, envVisualizer: true }
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
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      // Source 4
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.DEFAULT,
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.TYPED,
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.GPU,
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.NATIVE,
        supports: { dataVisualizer: true, envVisualizer: true }
      },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.EXPLICIT_CONTROL,
        supports: { dataVisualizer: true, envVisualizer: true }
      }
    ];

    expect(sourceLanguages).toMatchObject(expectedSourceConfigs);
  });
});
