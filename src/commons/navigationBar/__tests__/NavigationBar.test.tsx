import { useLocation } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';
import { Mock, vi } from 'vitest';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useLocation: vi.fn()
}));
vi.mock('react-redux', async () => ({
  ...(await vi.importActual('react-redux')),
  useSelector: vi.fn()
}));

const useSelectorMock = useTypedSelector as Mock;
const useLocationMock = useLocation as Mock;

describe('NavigationBar', () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue({
      pathname: 'localhost:8000/courses/1/game'
    });
  });

  it('Renders "Not logged in" correctly', () => {
    useSelectorMock.mockReturnValueOnce({});
    const tree = shallowRender(<NavigationBar />);
    expect(tree).toMatchSnapshot();
  });

  it('Renders correctly for student with course', () => {
    useSelectorMock.mockReturnValueOnce({
      role: Role.Student,
      name: 'Bob',
      courseId: 1,
      courseShortName: 'CS1101S',
      enableAchievements: true,
      enableContestLeaderboard: false,
      enableOverallLeaderboard: false,
      enableSourcecast: true,
      assessmentConfigurations: [
        {
          type: 'Missions'
        },
        {
          type: 'Quests'
        },
        {
          type: 'Paths'
        },
        {
          type: 'Contests'
        },
        {
          type: 'Missions'
        }
      ]
    });

    const tree = shallowRender(<NavigationBar />);
    expect(tree).toMatchSnapshot();
  });

  test('Renders correctly for student without course', () => {
    useSelectorMock.mockReturnValueOnce({
      name: 'Bob'
    });
    const tree = shallowRender(<NavigationBar />);
    expect(tree).toMatchSnapshot();
  });
});
