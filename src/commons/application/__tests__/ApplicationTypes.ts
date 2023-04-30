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
      { chapter: Chapter.SOURCE_2, variant: Variant.DEFAULT, supports: { substVisualizer: true } },
      { chapter: Chapter.SOURCE_2, variant: Variant.TYPED },
      { chapter: Chapter.SOURCE_2, variant: Variant.LAZY },
      { chapter: Chapter.SOURCE_2, variant: Variant.NATIVE, supports: { substVisualizer: true } },
      // Source 3
      { chapter: Chapter.SOURCE_3, variant: Variant.DEFAULT, supports: { envVisualizer: true } },
      { chapter: Chapter.SOURCE_3, variant: Variant.TYPED, supports: { envVisualizer: true } },
      { chapter: Chapter.SOURCE_3, variant: Variant.CONCURRENT },
      { chapter: Chapter.SOURCE_3, variant: Variant.NON_DET },
      { chapter: Chapter.SOURCE_3, variant: Variant.NATIVE, supports: { envVisualizer: true } },
      // Source 4
      { chapter: Chapter.SOURCE_4, variant: Variant.DEFAULT, supports: { envVisualizer: true } },
      { chapter: Chapter.SOURCE_4, variant: Variant.TYPED, supports: { envVisualizer: true } },
      { chapter: Chapter.SOURCE_4, variant: Variant.GPU, supports: { envVisualizer: true } },
      { chapter: Chapter.SOURCE_4, variant: Variant.NATIVE, supports: { envVisualizer: true } },
      {
        chapter: Chapter.SOURCE_4,
        variant: Variant.EXPLICIT_CONTROL,
        supports: { envVisualizer: true }
      }
    ];

    expect(sourceLanguages).toMatchObject(expectedSourceConfigs);
  });
});
