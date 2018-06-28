import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/api'
import { mockRouterProps } from '../../../mocks/components'
import AssessmentListing, { IAssessmentListingProps } from '../AssessmentListing'
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

test('AssessmentListing page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockUndefinedAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('AssessmentListing page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockEmptyAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('AssessmentListing page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockPresentAssessmentListing} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
