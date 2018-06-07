import { shallow } from 'enzyme'
import * as React from 'react'

import Login from '../Playground'

test('Login renders correctly', () => {
  const app = <Login />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
