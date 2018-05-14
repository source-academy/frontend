import * as React from 'react'

import { shallow } from 'enzyme'

import Playground from '../Playground'

test('Playground renders correctly', () => {
  const tree = shallow(<Playground title="Cadet" />)
  expect(tree.debug()).toMatchSnapshot()
})
