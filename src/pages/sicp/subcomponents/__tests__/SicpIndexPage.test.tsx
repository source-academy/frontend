import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import SicpIndexPage from '../../subcomponents/SicpIndexPage';
import { SicpLanguageContextProvider } from '../SicpLanguageProvider';

test('Sicp index page', async () => {
  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpLanguageContextProvider>
        <SicpIndexPage />
      </SicpLanguageContextProvider>
    </MemoryRouter>
  );
  expect(tree).toMatchSnapshot();
});
