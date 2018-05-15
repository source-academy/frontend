import * as React from 'react'

import { shallow } from 'enzyme'

import { mockRouterProps } from '../../mocks/components'
import { ApplicationEnvironment } from '../../reducers/application'
import { IApplicationProps } from '../Application'
import Playground from '../Playground'

test('Playground renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/dashboard', {}),
    application: {
      title: 'Cadet',
      environment: ApplicationEnvironment.Development
    }
  }
  const app = <Playground {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
