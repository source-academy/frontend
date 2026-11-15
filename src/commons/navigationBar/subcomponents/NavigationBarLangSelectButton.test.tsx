import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SupportedLanguage } from '../../../commons/application/ApplicationTypes';
import { mockInitialStore } from '../../../commons/mocks/StoreMocks';
import { renderTreeJson } from '../../../commons/utils/TestUtils';
import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { createStore } from '../../../pages/createStore';
import NavigationBarLangSelectButton from './NavigationBarLangSelectButton';

const mockConductorEnabled = vi.hoisted(() => ({ value: false }));
vi.mock('../../../features/conductor/flagConductorEnable', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../features/conductor/flagConductorEnable')>()),
  useConductorEnable: () => mockConductorEnabled.value,
}));

// Mock inspector
(window as any).Inspector = vi.fn();
(window as any).Inspector.highlightClean = vi.fn();

const createAppWithStore = () => {
  const store = createStore();
  const app = (
    <Provider store={store}>
      <MemoryRouter>
        <NavigationBarLangSelectButton />
      </MemoryRouter>
    </Provider>
  );
  return { app, store };
};

describe('NavigationBarLangSelectButton', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
    mockConductorEnabled.value = false;
  });

  it('should render correctly', async () => {
    const { app } = createAppWithStore();
    const wrapper = await renderTreeJson(app);
    expect(wrapper).toMatchSnapshot();
  });

  it('should call selectLang with "JavaScript" when "JavaScript" menu item is clicked', async () => {
    const { app, store } = createAppWithStore();
    const container = render(app);

    const button = await container.findByTestId('NavigationBarLangSelectButton');
    await user.click(button);

    // First menuitem
    const javascriptSelector = (await container.findAllByRole('menuitem'))[0];
    await user.click(javascriptSelector);

    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.JAVASCRIPT,
    );
  });

  describe('with Conductor enabled', () => {
    beforeEach(() => {
      mockConductorEnabled.value = true;
    });

    // [id, name, family] per language; the first one is selected.
    const renderWithLanguages = (languages: [string, string, string][]) => {
      const defs = languages.map(([id, name, family]) => ({ id, name, family, evaluators: [] }));
      const store = mockInitialStore({
        languageDirectory: {
          languages: defs,
          languageMap: Object.fromEntries(defs.map(d => [d.id, d])),
          selectedLanguageId: defs[0].id,
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
      return { container, dispatch };
    };

    it('lists each family once and selects its first variant', async () => {
      const { container, dispatch } = renderWithLanguages([
        ['source1', 'JavaScript §1', 'JavaScript'],
        ['python1', 'Python §1', 'Python'],
        ['python2', 'Python §2', 'Python'],
      ]);

      const button = await container.findByTestId('NavigationBarLangSelectButton');
      expect(button.textContent).toBe('JavaScript');
      await user.click(button);

      const items = await container.findAllByRole('menuitem');
      expect(items.map(item => item.textContent)).toEqual(['JavaScript', 'Python']);
      await user.click(items[1]);

      expect(dispatch).toHaveBeenCalledWith(
        LanguageDirectoryActions.setSelectedLanguage('python1'),
      );
    });

    it('is disabled when there is only one family', async () => {
      const { container } = renderWithLanguages([
        ['python1', 'Python §1', 'Python'],
        ['python2', 'Python §2', 'Python'],
      ]);

      const button = await container.findByTestId('NavigationBarLangSelectButton');
      expect(button.textContent).toBe('Python');
      expect(button).toBeDisabled();
    });
  });
});
