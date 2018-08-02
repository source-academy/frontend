import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import Assessment, { IAssessmentProps } from '../'
import { mockAssessmentOverviews } from '../../../mocks/assessmentAPI'
import { mockRouterProps } from '../../../mocks/components'
import { AssessmentCategories } from '../assessmentShape'

const defaultProps: IAssessmentProps = {
  assessmentCategory: AssessmentCategories.Mission,
  assessmentOverviews: undefined,
  handleAssessmentOverviewFetch: () => {},
  handleSubmitAssessment: (id: number) => {},
  ...mockRouterProps('/academy/missions', {})
}

const mockUndefinedAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: undefined
}

const mockEmptyAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: []
}

const mockPresentAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews
}

test('Assessment page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockUndefinedAssessment} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockEmptyAssessment} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockPresentAssessment} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
