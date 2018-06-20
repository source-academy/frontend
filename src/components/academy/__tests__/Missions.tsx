import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/api'
import { mockRouterProps } from '../../../mocks/components'
import AssessmentListing, { IAssessmentListingProps } from '../Missions'

const mockUndefinedMissions: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  handleAssessmentOverviewFetch: () => {}
}

const mockEmptyMissions: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: [],
  handleAssessmentOverviewFetch: () => {}
}

const mockPresentMissions: IAssessmentListingProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: mockAssessmentOverviews,
  handleAssessmentOverviewFetch: () => {}
}

test('Missions page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockUndefinedMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockEmptyMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentListing {...mockPresentMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
