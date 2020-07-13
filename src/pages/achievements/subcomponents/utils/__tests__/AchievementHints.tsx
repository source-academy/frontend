import { mount } from 'enzyme';
import React from 'react';

import AchievementHints from '../AchievementHints';

const normalWeekProps = {
  release: new Date()
};

const recessWeekProps = {
  release: new Date(2020, 8, 19, 0, 0, 0)
};

const readingWeekProps = {
  release: new Date(2020, 10, 14, 0, 0, 0)
};

const examWeekOneProps = {
  release: new Date(2020, 10, 21, 0, 0, 0)
};

const examWeekTwoProps = {
  release: new Date(2020, 10, 28, 0, 0, 0)
};

const vacationWeekProps = {
  release: new Date(2020, 11, 6, 0, 0, 0)
};

test('AchievementExp component renders correctly', () => {
  const normalWeek = <AchievementHints {...normalWeekProps} />;
  const tree = mount(normalWeek);
  expect(tree.debug()).toMatchSnapshot();

  const recessWeek = <AchievementHints {...recessWeekProps} />;
  const tree_1 = mount(recessWeek);
  expect(tree_1.debug()).toMatchSnapshot();

  const readingWeek = <AchievementHints {...readingWeekProps} />;
  const tree_2 = mount(readingWeek);
  expect(tree_2.debug()).toMatchSnapshot();

  const examWeekOne = <AchievementHints {...examWeekOneProps} />;
  const tree_3 = mount(examWeekOne);
  expect(tree_3.debug()).toMatchSnapshot();

  const examWeekTwo = <AchievementHints {...examWeekTwoProps} />;
  const tree_4 = mount(examWeekTwo);
  expect(tree_4.debug()).toMatchSnapshot();

  const vacationWeek = <AchievementHints {...vacationWeekProps} />;
  const tree_5 = mount(vacationWeek);
  expect(tree_5.debug()).toMatchSnapshot();
});
