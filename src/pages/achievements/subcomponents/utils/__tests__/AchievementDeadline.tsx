import { mount } from 'enzyme';
import React from 'react';

import AchievementDeadline from '../AchievementDeadline';

const undefinedDeadlineProps = {
  deadline: undefined
}

const expiredDeadlineProps = {
  deadline: new Date()
};

const urgentDeadlineProps = {
  deadline: new Date(Date.now() + (1000 * 60 * 60 * 2))
}

const daysDeadlineProps = {
  deadline: new Date(Date.now() + (1000 * 60 * 60 * 25))
}

const weeksDeadlineProps = {
  deadline: new Date(Date.now() + (1000 * 60 * 60 * 200))
}

test('AchievementDeadline component renders correctly', () => {
  const expiredDeadline = <AchievementDeadline {...expiredDeadlineProps} />;
  const tree_1 = mount(expiredDeadline);
  expect(tree_1.debug()).toMatchSnapshot();

  const urgentDeadline = <AchievementDeadline {...urgentDeadlineProps} />;
  const tree_2 = mount(urgentDeadline);
  expect(tree_2.debug()).toMatchSnapshot();

  const daysDeadline = <AchievementDeadline {...daysDeadlineProps} />;
  const tree_3 = mount(daysDeadline);
  expect(tree_3.debug()).toMatchSnapshot();

  const weeksDeadline = <AchievementDeadline {...weeksDeadlineProps} />;
  const tree_4 = mount(weeksDeadline);
  expect(tree_4.debug()).toMatchSnapshot();

  const undefinedDeadline = <AchievementDeadline {...undefinedDeadlineProps} />;
  const tree = mount(undefinedDeadline);
  expect(tree.debug()).toMatchSnapshot();
});
