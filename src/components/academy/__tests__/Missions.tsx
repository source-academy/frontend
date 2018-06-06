import * as React from 'react'

import { mount } from 'enzyme'

import Missions, { IMissionsProps } from '../Missions'

const mockUndefinedMissions: IMissionsProps = {
  handleMissionsInfoFetch: () => {}
}

const mockEmptyMissions: IMissionsProps = {
  missionsInfo: [],
  handleMissionsInfoFetch: () => {}
}

const mockPresentMissions: IMissionsProps = {
  missionsInfo: [
    {
      title: 'An Odessey to Runes',
      description:
        'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum in'
    },
    {
      title: 'The Secret to Streams',
      description:
        'Once upon a time, () => { Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum in }'
    }
  ],
  handleMissionsInfoFetch: () => {}
}

test('Missions page "loading" content renders correctly', () => {
  const app = <Missions {...mockUndefinedMissions} />
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with 0 missions renders correctly', () => {
  const app = <Missions {...mockEmptyMissions} />
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})

test('Missions page with multiple loaded missions renders correctly', () => {
  const app = <Missions {...mockPresentMissions} />
  const tree = mount(app)
  expect(tree.debug()).toMatchSnapshot()
})
