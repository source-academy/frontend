import { mount } from 'enzyme';
import React from 'react';

import AchievementWeek from '../AchievementWeek';

const normalWeekProps = {
  week: new Date()
};

const recessWeekProps = {
  week: new Date(2020, 8, 19, 0, 0, 0)
};

const readingWeekProps = {
  week: new Date(2020, 10, 14, 0, 0, 0)
};

const examWeekOneProps = {
  week: new Date(2020, 10, 21, 0, 0, 0)
};

const examWeekTwoProps = {
  week: new Date(2020, 10, 28, 0, 0, 0)
};

const vacationWeekProps = {
  week: new Date(2020, 11, 6, 0, 0, 0)
};

test('AchievementExp component renders correctly', () => {
  const normalWeek = <AchievementWeek {...normalWeekProps} />;
  const tree = mount(normalWeek);
  expect(tree.debug()).toMatchSnapshot();

  const recessWeek = <AchievementWeek {...recessWeekProps} />;
  const tree_1 = mount(recessWeek);
  expect(tree_1.debug()).toMatchSnapshot();

  const readingWeek = <AchievementWeek {...readingWeekProps} />;
  const tree_2 = mount(readingWeek);
  expect(tree_2.debug()).toMatchSnapshot();

  const examWeekOne = <AchievementWeek {...examWeekOneProps} />;
  const tree_3 = mount(examWeekOne);
  expect(tree_3.debug()).toMatchSnapshot();

  const examWeekTwo = <AchievementWeek {...examWeekTwoProps} />;
  const tree_4 = mount(examWeekTwo);
  expect(tree_4.debug()).toMatchSnapshot();

  const vacationWeek = <AchievementWeek {...vacationWeekProps} />;
  const tree_5 = mount(vacationWeek);
  expect(tree_5.debug()).toMatchSnapshot();
});
