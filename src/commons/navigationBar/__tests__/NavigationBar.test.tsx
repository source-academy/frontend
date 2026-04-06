import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import { vi } from 'vitest';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

const renderNav = (store: any) =>
  render(
    <Provider store={store}>
      <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, vi.fn()]}>
        <MemoryRouter initialEntries={['/courses/1/game']}>
          <NavigationBar />
        </MemoryRouter>
      </WorkspaceSettingsContext.Provider>
    </Provider>
  );

describe('NavigationBar', () => {
  it('Renders "Not logged in" correctly', () => {
    const store = mockInitialStore({
      session: {
        role: undefined,
        name: undefined
      }
    });

    const tree = renderNav(store);
    expect(tree.asFragment()).toMatchSnapshot();
  });

  it('Renders correctly for student with course', () => {
    const store = mockInitialStore({
      session: {
        role: Role.Student,
        name: 'Bob',
        courseId: 1,
        courseShortName: 'CS1101S',
        assessmentConfigurations: [
          {
            type: 'Missions'
          } as any,
          {
            type: 'Quests'
          } as any,
          {
            type: 'Paths'
          } as any,
          {
            type: 'Contests'
          } as any
        ]
      }
    });

    const tree = renderNav(store);
    expect(tree.asFragment()).toMatchSnapshot();
  });

  test('Renders correctly for student without course', () => {
    const store = mockInitialStore({
      session: {
        role: undefined,
        name: 'Bob',
        courseId: undefined
      }
    });

    const tree = renderNav(store);
    expect(tree.asFragment()).toMatchSnapshot();
  });
});
