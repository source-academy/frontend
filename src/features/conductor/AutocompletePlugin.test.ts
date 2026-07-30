import { describe, expect, test } from 'vitest';

import { isKeywordMapperToken } from './autocompleteHighlightRules';

describe('AutoCompletePlugin highlight rules', () => {
  test('accepts a null token without treating it as a keyword mapper', () => {
    expect(isKeywordMapperToken(null)).toBe(false);
    expect(isKeywordMapperToken(['keyword'])).toBe(false);
    expect(isKeywordMapperToken({ map: {}, defaultToken: 'identifier' })).toBe(true);
  });
});
