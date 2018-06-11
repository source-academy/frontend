import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter } from 'react-router'

import { mockRouterProps } from '../../../mocks/components'
import Missions, { IMissionsProps } from '../Missions'

const mockUndefinedMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  handleMissionsInfoFetch: () => {}
}

const mockEmptyMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  missionsInfo: [],
  handleMissionsInfoFetch: () => {}
}

const mockPresentMissions: IMissionsProps = {
  ...mockRouterProps('/academy/missions', {}),
  missionsInfo: [
    {
      id: 0,
      title: 'An Odessey to Runes',
      description:
        'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum in'
    },
    {
      id: 1,
      title: 'The Secret to Streams',
      description:
        'Once upon a time, () => { Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum in }'
    }
  ],
  handleMissionsInfoFetch: () => {}
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
