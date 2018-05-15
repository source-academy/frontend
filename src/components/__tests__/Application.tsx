import * as React from 'react'

import { shallow } from 'enzyme'

import { mockRouterProps } from '../../mocks/components'
import { ApplicationEnvironment } from '../../reducers/application'
import Application, { IApplicationProps } from '../Application'

test('Application renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/dashboard', {}),
    application: {
      title: 'Cadet',
      environment: ApplicationEnvironment.Development
    }
  }
  const app = <Application {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
