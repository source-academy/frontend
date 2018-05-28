import * as React from 'react'

import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { mockInitialStore } from '../../mocks/store'
import ApplicationContainer from '../ApplicationContainer'

test('ApplicationContainer redirects from / to /dashboard', () => {
  const store = mockInitialStore()
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <ApplicationContainer />
      </MemoryRouter>
    </Provider>
  )
  const tree = mount(app)
  expect(tree.find('.Device').length).toBe(1)
  expect(tree.find('.NavigationBar__link.pt-active').contains('Device')).toBe(true)
})

test('ApplicationContainer renders NotFound on unknown routes', () => {
  const store = mockInitialStore()
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <ApplicationContainer />
      </MemoryRouter>
    </Provider>
  )
  const tree = mount(app)
  expect(tree.find('.NotFound').length).toBe(1)
  expect(tree.find('.NavigationBar__link.pt-active').length).toBe(0)
})
