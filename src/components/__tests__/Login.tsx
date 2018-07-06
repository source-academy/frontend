import { shallow } from 'enzyme'
import * as React from 'react'

import Login from '../Login'

test('Login renders correctly', () => {
  const props = {
    handleLogin: () => {}
  }
  const app = <Login {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Loading login renders correctly', () => {
  const props = {
    handleLogin: () => {},
    isLoading: true
  }
  const app = <Login {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
