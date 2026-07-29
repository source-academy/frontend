import type { KeywordMapperArgs } from '@sourceacademy/common-autocomplete';

export const isKeywordMapperToken = (token: unknown): token is KeywordMapperArgs =>
  typeof token === 'object' && token !== null && !Array.isArray(token) && 'map' in token;
