import * as React from 'react'

import { shallow } from 'enzyme'

import { Playground } from '../Playground'

test('Playground renders correctly', () => {
  const app = <Playground />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
