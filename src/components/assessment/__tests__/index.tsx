import { shallow } from 'enzyme'
import * as React from 'react'

import { mockAssessments } from '../../../mocks/assessmentAPI'
import Assessment, { AssessmentProps } from '../index'

const defaultProps: AssessmentProps = {
  activeTab: 0,
  assessmentId: 0,
  editorWidth: '50%',
  handleAssessmentFetch: (assessmentId: number) => {},
  handleChangeActiveTab: (activeTab: number) => {},
  handleChapterSelect: (chapter: any, changeEvent: any) => {},
  handleEditorEval: () => {},
  handleEditorValueChange: (val: string) => {},
  handleEditorWidthChange: (widthChange: number) => {},
  handleInterruptEval: () => {},
  handleReplEval: () => {},
  handleReplOutputClear: () => {},
  handleReplValueChange: (newValue: string) => {},
  handleSideContentHeightChange: (heightChange: number) => {},
  isRunning: false,
  output: [],
  questionId: 0,
  replValue: ''
}

const mockUndefinedAssessmentProps: AssessmentProps = {
  ...defaultProps
}

const mockProgrammingAssessmentProps: AssessmentProps = {
  ...defaultProps,
  assessment: mockAssessments[0],
  assessmentId: 0,
  questionId: 0
}

const mockMcqAssessmentProps: AssessmentProps = {
  ...defaultProps,
  assessment: mockAssessments[0],
  assessmentId: 0,
  questionId: 2
}

test('Assessment page "loading" content renders correctly', () => {
  const app = <Assessment {...mockUndefinedAssessmentProps} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with programming question renders correctly', () => {
  const app = <Assessment {...mockProgrammingAssessmentProps} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with MCQ question renders correctly', () => {
  const app = <Assessment {...mockMcqAssessmentProps} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
