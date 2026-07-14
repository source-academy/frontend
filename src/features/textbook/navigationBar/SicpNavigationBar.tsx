import toc from 'src/features/sicp/data/toc.json';
import tocNavigation from 'src/features/sicp/data/toc-navigation.json';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import { fetchSicpSearchData } from './autocomplete/query';
import SicpTextbookNavigationBar from './SicpTextbookNavigationBar';

function SicpNavigationBar() {
  return (
    <SicpTextbookNavigationBar
      routePrefix="/sicpjs"
      getPrev={section => getPrev(tocNavigation, section)}
      getNext={section => getNext(tocNavigation, section)}
      queryKey="sicpSearchData"
      fetchSearchData={fetchSicpSearchData}
      toc={toc}
    />
  );
}

export default SicpNavigationBar;
