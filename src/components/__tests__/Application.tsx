import { shallow } from 'enzyme'
import * as React from 'react'

import { mockRouterProps } from '../../mocks/components'
import Application, { IApplicationProps } from '../Application'

test('Application renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/academy', {}),
    title: 'Cadet',
    handleChangeChapter: (chp: any) => {},
    handleEditorValueChange: (val: string) => {},
    handleFetchTokens: (ivleToken: string) => {},
    handleFetchUsername: () => {}
  }
  const app = <Application {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
