import tocNavigation from 'src/features/sicp/data/toc-navigation-py.json';
import toc from 'src/features/sicp/data/toc-py.json';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { fetchSicpySearchData } from './autocomplete/query';
import SicpTextbookNavigationBar from './SicpTextbookNavigationBar';

function SicPyNavigationBar() {
  return (
    <SicpTextbookNavigationBar
      routePrefix="/sicpy"
      getPrev={section => getPrev(tocNavigation, section)}
      getNext={section => getNext(tocNavigation, section)}
      queryKey="sicpPySearchData"
      fetchSearchData={fetchSicpySearchData}
      toc={toc}
    />
  );
}

export default SicPyNavigationBar;
