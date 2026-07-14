import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import tocNavigation from '../toc/data/sicpjs-navigation.json';
import toc from '../toc/data/sicpjs-toc.json';
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
