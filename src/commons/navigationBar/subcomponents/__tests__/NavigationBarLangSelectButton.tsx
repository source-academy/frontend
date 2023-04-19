import { mount } from 'enzyme';
import { Provider } from 'react-redux';
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
    console.log(
      wrapper.findWhere(node => node.type() === 'li' && node.text() === 'Scheme').debug()
    );
    wrapper
      .findWhere(node => node.type() === 'li' && node.text() === 'Scheme')
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.lang).toEqual('Scheme');
  });

  it('should call selectLang with "Python" when "Python" menu item is clicked', () => {
    const wrapper = mount(
      <Provider store={store}>
        <NavigationBarLangSelectButton />
      </Provider>
    );
    wrapper.find('button').simulate('click');
    wrapper
      .findWhere(node => node.type() === 'li' && node.text() === 'Python')
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.lang).toEqual('Python');
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
      .findWhere(node => node.type() === 'li' && node.text() === 'JavaScript')
      .find('a[role="menuitem"]')
      .simulate('click');
    expect(store.getState().playground.lang).toEqual('JavaScript');
  });
});
