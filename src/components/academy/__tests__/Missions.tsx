import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockAssessmentOverviews } from '../../../mocks/api'
import { mockRouterProps } from '../../../mocks/components'
import AssessmentViewer, { IAssessmentViewerProps } from '../Missions'

const mockUndefinedMissions: IAssessmentViewerProps = {
  ...mockRouterProps('/academy/missions', {}),
  handleAssessmentOverviewFetch: () => {}
}

const mockEmptyMissions: IAssessmentViewerProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: [],
  handleAssessmentOverviewFetch: () => {}
}

const mockPresentMissions: IAssessmentViewerProps = {
  ...mockRouterProps('/academy/missions', {}),
  assessmentOverviews: mockAssessmentOverviews,
  handleAssessmentOverviewFetch: () => {}
}

test('Missions page "loading" content renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentViewer {...mockUndefinedMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with 0 missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentViewer {...mockEmptyMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with multiple loaded missions renders correctly', () => {
  const app = (
    <MemoryRouter initialEntries={['/unknown']}>
      <AssessmentViewer {...mockPresentMissions} />
    </MemoryRouter>
  )
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
