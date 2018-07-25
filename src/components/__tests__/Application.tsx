import { shallow } from 'enzyme'
import * as React from 'react'

import { mockRouterProps } from '../../mocks/components'
import Application, { IApplicationProps } from '../Application'
import { ExternalLibraryName, ExternalLibraryNames } from '../assessment/assessmentShape'

test('Application renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/academy', {}),
    title: 'Cadet',
    currentPlaygroundChapter: 2,
    handleEditorValueChange: (val: string) => {},
    handleLogOut: () => {}
    currentPlaygroundExternalLibrary: ExternalLibraryNames.NONE,
    handleClearContext: (chapter: number, externalLibraryName: ExternalLibraryName) => {},
  }
  const app = <Application {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
