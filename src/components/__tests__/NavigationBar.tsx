import * as React from 'react'

import { shallow } from 'enzyme'

import NavigationBar from '../NavigationBar'

test('NavigationBar renders correctly', () => {
  const tree = shallow(<NavigationBar title="Cadet" />)
  expect(tree.debug()).toMatchSnapshot()
})
