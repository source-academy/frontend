import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/assessmentAPI'
import { mockRouterProps } from '../../../mocks/components'
import Assessment, { IAssessmentListingProps } from '../'
import { AssessmentCategories } from '../assessmentShape'

const defaultProps: IAssessmentListingProps = {
  assessmentCategory: AssessmentCategories.Mission,
  assessmentOverviews: undefined,
  handleAssessmentOverviewFetch: () => {},
  handleResetAssessmentWorkspace: () => {},
  handleUpdateCurrentAssessmentId: (assessmentId: number, questionId: number) => {},
  ...mockRouterProps('/academy/missions', {})
}

const mockUndefinedAssessmentListing: IAssessmentListingProps = {
  ...defaultProps,
  assessmentOverviews: undefined
}

const mockEmptyAssessmentListing: IAssessmentListingProps = {
  ...defaultProps,
  assessmentOverviews: []
}

const mockPresentAssessmentListing: IAssessmentListingProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews
}

test('Assessment page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockUndefinedAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockEmptyAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Assessment page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Assessment {...mockPresentAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
