import * as React from 'react'

import { shallow } from 'enzyme'

import Control, { IControlProps } from '../Control'

test('Control renders correctly', () => {
  const props: IControlProps = {
    handleEvalEditor: () => {},
    handleEvalRepl: () => {},
    handleClearReplOutput: () => {},
    handleChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => {}
  }
  const app = <Control {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
