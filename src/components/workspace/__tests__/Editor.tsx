import * as React from 'react'

import { shallow } from 'enzyme'

import Editor, { IEditorProps } from '../Editor'

test('Editor renders correctly', () => {
  const props: IEditorProps = {
    editorValue: '',
    isRunning: false,
    sourceChapter: 2,
    handleChapterSelect: (i, e) => {},
    handleEditorValueChange: newCode => {},
    handleEditorEval: () => {},
    handleInterruptEval: () => {}
  }
  const app = <Editor {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
