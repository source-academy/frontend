import { shallow } from 'enzyme'
import * as React from 'react'

import { mockRouterProps } from '../../mocks/components'
import Playground, { IPlaygroundProps } from '../Playground'

const baseProps = {
  editorValue: "",
  isRunning: false,
  activeTab: 0,
  editorWidth: "50%",
  sideContentHeight: 40,
  output: [],
  replValue: "",
  handleEditorValueChange: () => {} 
  handleChapterSelect: (i: any, e: any) => {},
  handleChangeActiveTab: (n: number) => {},
  handleEditorEval: () => {}, 
  handleReplEval: () => {}, 
  handleReplOutputClear: () => {},
  handleInterruptEval: () => {}, 
  handleEditorWidthChange: (widthChange: number) => {}, 
  handleSideContentHeightChange: (h: number) => {}, 
  handleReplValueChange: (code: string) => {}
}

const testValueProps: IPlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/academy', {}),
  editorValue: 'Test value'
}

const playgroundLinkProps: IPlaygroundProps = {
  ...baseProps,
  ...mockRouterProps('/playground#lib=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA', {}),
  editorValue: 'This should not show up'
}

test('Playground renders correctly', () => {
  const app = <Playground {...testValueProps} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Playground with link renders correctly', () => {
  const app = <Playground {...playgroundLinkProps} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
