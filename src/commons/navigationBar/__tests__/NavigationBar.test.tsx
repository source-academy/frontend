import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

vi.mock(import('react-router'), async importOriginal => ({
  ...(await importOriginal()),
  useLocation: vi.fn()
}));

vi.mock(import('react-redux'), async importOriginal => ({
  ...(await importOriginal()),
  useSelector: vi.fn()
}));

const useSelectorMock = vi.mocked(useTypedSelector)
const useLocationMock = vi.mocked(useLocation);

describe(NavigationBar, () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue({
      pathname: 'localhost:8000/courses/1/game'
    } as any);
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

  it('Renders correctly for student without course', () => {
    useSelectorMock.mockReturnValueOnce({
      name: 'Bob'
    });
    const tree = shallowRender(<NavigationBar />);
    expect(tree).toMatchSnapshot();
  });
});
