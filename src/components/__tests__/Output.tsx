import * as React from 'react'

import { shallow } from 'enzyme'

import Output from '../Output'

test('Output renders correctly', () => {
  const props = {
    output: ['abc', 'def', 'ghi']
  }
  const app = <Output {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
