import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Tokens } from '../commons/application/types/SessionTypes';
import { getGradingOverviews } from '../commons/sagas/RequestsSaga';
import type { GradingOverviewsParams } from '../features/grading/GradingTypes';

export const grading = createQueryKeys('grading', {
  overviews: (params: GradingOverviewsParams, tokens: Tokens) => ({
    queryKey: [params],
    queryFn: () =>
      getGradingOverviews(
        tokens,
        params.group,
        params.graded,
        params.pageParams,
        params.filterParams,
        params.sortedBy,
      ),
  }),
});
