import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/api'
import { mockRouterProps } from '../../../mocks/components'
import Missions, { IMissionsProps } from '../Missions'

const mockUndefinedMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  handleAssessmentOverviewFetch: () => {}
}

const mockEmptyMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: [],
  handleAssessmentOverviewFetch: () => {}
}

const mockPresentMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: mockAssessmentOverviews,
  handleAssessmentOverviewFetch: () => {}
}

test('Missions page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Missions {...mockUndefinedMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Missions {...mockEmptyMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <Missions {...mockPresentMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
