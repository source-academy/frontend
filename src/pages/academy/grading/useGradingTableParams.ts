import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  applyGradingTableParams,
  type GradingTableParams,
  type GradingTableSort,
  parseGradingTableParams,
} from 'src/features/grading/gradingTableParams';
import type { ColumnFiltersState } from 'src/features/grading/GradingTypes';

export function useGradingTableParams() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = useMemo(() => parseGradingTableParams(searchParams), [searchParams]);

  // keep the latest searchParams, so that two updates in the same tick do not overwrite each other
  const searchParamsRef = useRef(searchParams);
  useLayoutEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateParams = useCallback(
    (changes: Partial<GradingTableParams>) => {
      const next = applyGradingTableParams(searchParamsRef.current, changes);
      if (next.toString() === searchParamsRef.current.toString()) {
        return;
      }
      searchParamsRef.current = next;
      navigate({ search: next.toString() }, { replace: true });
    },
    [navigate],
  );

  const setters = useMemo(
    () => ({
      setPage: (page: number) => updateParams({ page }),
      setPageSize: (pageSize: number) => updateParams({ pageSize, page: 0 }),
      setShowAllSubmissions: (showAllSubmissions: boolean) =>
        updateParams({ showAllSubmissions, page: 0 }),
      setShowUserGroups: (showUserGroups: boolean | undefined) =>
        updateParams({ showUserGroups, page: 0 }),
      setSort: (sort: GradingTableSort | undefined) => updateParams({ sort, page: 0 }),
      setColumnFilters: (columnFilters: ColumnFiltersState) =>
        updateParams({ columnFilters, page: 0 }),
    }),
    [updateParams],
  );

  return { ...params, ...setters };
}
