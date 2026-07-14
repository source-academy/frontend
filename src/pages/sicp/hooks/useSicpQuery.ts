import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { setLocalStorage } from 'src/commons/hooks/useLocalStorageState';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { queries } from 'src/queryKeys';

export const SICP_INDEX = 'index';
export const SICP_CACHE_KEY = 'sicp-section';

function useSicpSectionPersistence(
  section: string | undefined,
  data: unknown,
  error: unknown,
  opts: { key: string; defaultSection: string },
) {
  // Store the latest viewed section. Reset to default on error so a stale or
  // broken URL doesn't pin the redirect to a dead section.
  useEffect(() => {
    if (!section) {
      return;
    }
    if (section === opts.defaultSection) {
      setLocalStorage(opts.key, opts.defaultSection);
      return;
    }
    if (data) {
      setLocalStorage(opts.key, section);
    } else {
      setLocalStorage(opts.key, opts.defaultSection);
    }
  }, [data, error, section, opts.key, opts.defaultSection]);
}

export function useSicpJsSectionQuery(section: string | undefined) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const { data, error, isPending, isFetching } = useQuery({
    ...queries.sicp.sectionJs(section ?? ''),
    enabled: !!section && section !== SICP_INDEX,
    select: json => {
      try {
        return parseArr(json, refs);
      } catch (e) {
        throw new ParseJsonError('Failed to parse SICP JSON', { cause: e });
      }
    },
  });

  useSicpSectionPersistence(section, data, error, {
    key: SICP_CACHE_KEY,
    defaultSection: SICP_INDEX,
  });

  return { data, error, isPending, isFetching, refs };
}

export const SICPY_INDEX = 'index';
export const SICPY_CACHE_KEY = 'sicPy-section';

export function useSicPySectionQuery(section: string | undefined) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const { data, error, isPending, isFetching } = useQuery({
    ...queries.sicp.sectionPy(section ?? ''),
    enabled: !!section && section !== SICPY_INDEX,
    select: json => {
      try {
        return parseArr(json, refs);
      } catch (e) {
        throw new ParseJsonError('Failed to parse SICPy JSON', { cause: e });
      }
    },
  });

  useSicpSectionPersistence(section, data, error, {
    key: SICPY_CACHE_KEY,
    defaultSection: SICPY_INDEX,
  });

  return { data, error, isPending, isFetching, refs };
}
