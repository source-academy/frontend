import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import tocNavigation from '../toc/data/sicpy-navigation.json';
import toc from '../toc/data/sicpy-toc.json';
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
