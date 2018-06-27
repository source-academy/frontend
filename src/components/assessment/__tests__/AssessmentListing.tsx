import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/api'
import { mockRouterProps } from '../../../mocks/components'
import AssessmentListing, { IAssessmentListingProps } from '../AssessmentListing'
import { AssessmentCategories } from '../assessmentShape'

const mockUndefinedAssessmentListing: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  handleAssessmentOverviewFetch: () => {},
  assessmentCategory: AssessmentCategories.Mission
}

const mockEmptyAssessmentListing: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: [],
  handleAssessmentOverviewFetch: () => {},
  assessmentCategory: AssessmentCategories.Mission
}

const mockPresentAssessmentListing: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: mockAssessmentOverviews,
  handleAssessmentOverviewFetch: () => {},
  assessmentCategory: AssessmentCategories.Mission
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
