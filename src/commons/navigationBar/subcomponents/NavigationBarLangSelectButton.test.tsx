import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { mockInitialStore } from '../../../commons/mocks/StoreMocks';
import { renderTreeJson } from '../../../commons/utils/TestUtils';
import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { createStore } from '../../../pages/createStore';
import NavigationBarLangSelectButton from './NavigationBarLangSelectButton';

// Mock inspector
(window as any).Inspector = vi.fn();
(window as any).Inspector.highlightClean = vi.fn();

describe('NavigationBarLangSelectButton', () => {
  it('should render correctly', async () => {
    const app = (
      <Provider store={createStore()}>
        <MemoryRouter>
          <NavigationBarLangSelectButton />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = await renderTreeJson(app);
    expect(wrapper).toMatchSnapshot();
  });

  it('selects the clicked directory language', async () => {
    const store = mockInitialStore({
      languageDirectory: {
        languages: [
          { id: 'python1', name: 'Python §1', evaluators: [] },
          { id: 'python2', name: 'Python §2', evaluators: [] },
        ],
        languageMap: {
          python1: { id: 'python1', name: 'Python §1', evaluators: [] },
          python2: { id: 'python2', name: 'Python §2', evaluators: [] },
        },
        selectedLanguageId: 'python1',
      },
    });
    const dispatch = vi.spyOn(store, 'dispatch');
    const container = render(
      <Provider store={store}>
        <MemoryRouter>
          <NavigationBarLangSelectButton />
        </MemoryRouter>
      </Provider>,
    );

    const user = userEvent.setup();
    await user.click(await container.findByTestId('NavigationBarLangSelectButton'));
    await user.click(await container.findByText('Python §2'));

    expect(dispatch).toHaveBeenCalledWith(LanguageDirectoryActions.setSelectedLanguage('python2'));
  });
});
