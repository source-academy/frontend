import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { SupportedLanguage } from 'src/commons/application/ApplicationTypes';
import { store } from 'src/pages/createStore';

import NavigationBarLangSelectButton from '../NavigationBarLangSelectButton';

describe('NavigationBarLangSelectButton', () => {
  it('should render correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NavigationBarLangSelectButton />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should call selectLang with "Scheme" when "Scheme" menu item is clicked', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NavigationBarLangSelectButton />
      </Provider>
    );
    wrapper.find('button').simulate('click');
    wrapper
      .findWhere(node => node.type() === 'li' && node.text() === SupportedLanguage.SCHEME)
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.SCHEME
    );
  });

  it('should call selectLang with "Python" when "Python" menu item is clicked', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NavigationBarLangSelectButton />
      </Provider>
    );
    wrapper.find('button').simulate('click');
    wrapper
      .findWhere(node => node.type() === 'li' && node.text() === SupportedLanguage.PYTHON)
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.PYTHON
    );
  });

  it('should call selectLang with "JavaScript" when "JavaScript" menu item is clicked', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NavigationBarLangSelectButton />
      </Provider>
    );
    console.log(wrapper.debug());
    wrapper.find('button').simulate('click');
    wrapper
      .findWhere(node => node.type() === 'li' && node.text() === SupportedLanguage.JAVASCRIPT)
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.languageConfig.mainLanguage).toEqual(
      SupportedLanguage.JAVASCRIPT
    );
  });
});
