import { shallow } from 'enzyme'
import * as React from 'react'

import { mockRouterProps } from '../../mocks/components'
import Playground from '../Playground'

test('Playground renders correctly', () => {
  const props = {
    ...mockRouterProps('/academy', {}),
    editorValue: 'Test value'
  }
  const app = <Playground {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
