import { useQuery } from '@tanstack/react-query';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';
import { queries } from 'src/queryKeys';

import { fetchSicpySearchData } from './autocomplete/query';
import SicpTextbookNavigationBar from './SicpTextbookNavigationBar';

function SicPyNavigationBar() {
  const { data: toc } = useQuery(queries.sicp.tocPy);
  const { data: tocNavigation } = useQuery(queries.sicp.tocNavigationPy);

  return (
    <SicpTextbookNavigationBar
      routePrefix="/sicpy"
      getPrev={section => getPrev(tocNavigation ?? {}, section)}
      getNext={section => getNext(tocNavigation ?? {}, section)}
      queryKey="sicpPySearchData"
      fetchSearchData={fetchSicpySearchData}
      toc={toc ?? []}
    />
  );
}

export default SicPyNavigationBar;
