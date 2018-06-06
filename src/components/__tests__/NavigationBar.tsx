import * as React from 'react'

import { shallow } from 'enzyme'

import NavigationBar from '../NavigationBar'

test('NavigationBar renders "Not logged in" correctly', () => {
  const tree = shallow(<NavigationBar title="Cadet" />)
  expect(tree.debug()).toMatchSnapshot()
})

test('NavigationBar renders correctly with username', () => {
  const tree = shallow(<NavigationBar title="Cadet" username="Evis Rucer" />)
  expect(tree.debug()).toMatchSnapshot()
})
