import { shallow } from 'enzyme'
import * as React from 'react'

import { ResultOutput } from '../../../reducers/states'
import Output from '../Output'

test('Output renders correctly', () => {
  const props = {
    output: [{ type: 'result', value: 'abc' } as ResultOutput]
  }
  const app = <Output {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
