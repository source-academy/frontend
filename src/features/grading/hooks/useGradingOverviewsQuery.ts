import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Role } from 'src/commons/application/ApplicationTypes';
import type { Tokens } from 'src/commons/application/types/SessionTypes';
import { useSession, useTokens } from 'src/commons/utils/Hooks';
import type { GradingOverviewsParams } from 'src/features/grading/GradingTypes';
import { queries } from 'src/queryKeys';

/**
 * Fetches the grading overviews table data for the given query parameters.
 * Replaces the former `fetchGradingOverviews` saga + `state.session.gradingOverviews`.
 */
export function useGradingOverviewsQuery(params: GradingOverviewsParams) {
  const tokens = useTokens({ throwWhenEmpty: false });
  const { role } = useSession();
  return useQuery({
    // `enabled` guarantees both tokens are present before the queryFn runs.
    ...queries.grading.overviews(params, tokens as Tokens),
    enabled:
      !!tokens.accessToken && !!tokens.refreshToken && role !== undefined && role !== Role.Student,
    placeholderData: keepPreviousData,
  });
}
