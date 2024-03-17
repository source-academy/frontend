import { useLocation } from 'react-router-dom';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));

const useSelectorMock = useTypedSelector as jest.Mock;
const useLocationMock = useLocation as jest.Mock;

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
