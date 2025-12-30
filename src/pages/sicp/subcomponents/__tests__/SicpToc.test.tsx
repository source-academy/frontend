import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import { SicpLanguageContextProvider } from '../SicpLanguageProvider';
import SicpToc from '../SicpToc';

test('Sicp toc renders correctly', async () => {
  const props = {
    handleCloseToc: () => {}
  };

  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpLanguageContextProvider>
        <SicpToc {...props} />
      </SicpLanguageContextProvider>
    </MemoryRouter>
  );
  expect(tree).toMatchSnapshot();
});
