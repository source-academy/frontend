import * as React from 'react'

import { shallow } from 'enzyme'

import { mockRouterProps } from '../../mocks/components'
import Application, { IApplicationProps } from '../Application'

test('Application renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/academy', {}),
    title: 'Cadet'
  }
  const app = <Application {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
