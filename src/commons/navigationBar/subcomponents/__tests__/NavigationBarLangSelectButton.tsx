import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { Provider } from 'react-redux';

import { SupportedLanguage } from '../../../../commons/application/ApplicationTypes';
import { renderTreeJson } from '../../../../commons/utils/TestUtils';
import { createStore } from '../../../../pages/createStore';
import NavigationBarLangSelectButton from '../NavigationBarLangSelectButton';

// Mock inspector
(window as any).Inspector = jest.fn();
(window as any).Inspector.highlightClean = jest.fn();

const createAppWithStore = () => {
  const store = createStore();
  const app = (
    <Provider store={store}>
      <NavigationBarLangSelectButton />
    </Provider>
  );
  return { app, store };
};

describe('NavigationBarLangSelectButton', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render correctly', async () => {
    const { app } = createAppWithStore();
    const wrapper = await renderTreeJson(app);
    expect(wrapper).toMatchSnapshot();
  });

  it('should call selectLang with "Scheme" when "Scheme" menu item is clicked', async () => {
    const { app, store } = createAppWithStore();
    const container = render(app);

    const button = await container.findByTestId('NavigationBarLangSelectButton');
    await user.click(button);

    const schemeSelector = await container.findByText(SupportedLanguage.SCHEME);
    await user.click(schemeSelector);

    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.SCHEME
    );
  });

  it('should call selectLang with "Python" when "Python" menu item is clicked', async () => {
    const { app, store } = createAppWithStore();
    const container = render(app);

    const button = await container.findByTestId('NavigationBarLangSelectButton');
    await user.click(button);

    const pythonSelector = await container.findByText(SupportedLanguage.PYTHON);
    await user.click(pythonSelector);

    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.PYTHON
    );
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
      SupportedLanguage.JAVASCRIPT
    );
  });
});
