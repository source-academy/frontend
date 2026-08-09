import { useQuery } from '@tanstack/react-query';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import { queries } from 'src/queryKeys';

import { fetchSicpSearchData } from './autocomplete/query';
import SicpTextbookNavigationBar from './SicpTextbookNavigationBar';

function SicpNavigationBar() {
  const { data: toc } = useQuery(queries.sicp.tocJs);
  const { data: tocNavigation } = useQuery(queries.sicp.tocNavigationJs);

  return (
    <SicpTextbookNavigationBar
      routePrefix="/sicpjs"
      getPrev={section => getPrev(tocNavigation ?? {}, section)}
      getNext={section => getNext(tocNavigation ?? {}, section)}
      queryKey="sicpSearchData"
      fetchSearchData={fetchSicpSearchData}
      toc={toc ?? []}
    />
  );
}

export default SicpNavigationBar;
