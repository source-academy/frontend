import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Role } from '../application/ApplicationTypes';
import NavigationBar from './NavigationBar';

const mockConductorEnabled = vi.hoisted(() => ({ value: false }));
vi.mock('../../features/conductor/flagConductorEnable', async importOriginal => ({
  ...(await importOriginal<typeof import('../../features/conductor/flagConductorEnable')>()),
  useConductorEnable: () => mockConductorEnabled.value,
}));

const renderNav = (store: any) =>
  render(
    <Provider store={store}>
      <WorkspaceSettingsContext.Provider value={[{ editorBinding: EditorBinding.NONE }, vi.fn()]}>
        <MemoryRouter initialEntries={['/courses/1/game']}>
          <NavigationBar />
        </MemoryRouter>
      </WorkspaceSettingsContext.Provider>
    </Provider>,
  );

describe('NavigationBar', () => {
  it('Renders "Not logged in" correctly', () => {
    const store = mockInitialStore({
      session: {
        role: undefined,
        name: undefined,
      },
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
            type: 'Missions',
          } as any,
          {
            type: 'Quests',
          } as any,
          {
            type: 'Paths',
          } as any,
          {
            type: 'Contests',
          } as any,
        ],
      },
    });

    const tree = renderNav(store);
    expect(tree.asFragment()).toMatchSnapshot();
  });

  test('Renders correctly for student without course', () => {
    const store = mockInitialStore({
      session: {
        role: undefined,
        name: 'Bob',
        courseId: undefined,
      },
    });

    const tree = renderNav(store);
    expect(tree.asFragment()).toMatchSnapshot();
  });

  describe('textbook button', () => {
    const studentStore = () =>
      mockInitialStore({
        session: { role: Role.Student, name: 'Bob', courseId: 1, courseShortName: 'CS1101S' },
      });

    beforeEach(() => {
      mockConductorEnabled.value = false;
    });

    it('defaults to SICP JS for the legacy Source languages', () => {
      renderNav(studentStore());
      expect(screen.getAllByText('SICP JS').length).toBeGreaterThan(0);
    });

    it('is absent for a Conductor language without a textbook', () => {
      mockConductorEnabled.value = true;
      renderNav(studentStore());
      expect(screen.queryByText('SICP JS')).toBeNull();
    });
  });
});
