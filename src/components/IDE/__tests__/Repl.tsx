import { shallow } from 'enzyme'
import * as React from 'react'

import { ResultOutput } from '../../../reducers/states'
import Repl, { Output } from '../Repl'

test('Repl renders correctly', () => {
  const props = {
    output: [{ type: 'result', value: 'abc' } as ResultOutput]
  }
  const app = <Repl {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})

test("Output renders correctly for InterpreterOutput.type === 'result'", () => {
  const props: ResultOutput = { type: 'result', value: 'def' }
  const app = <Output {...{ output: props }} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
