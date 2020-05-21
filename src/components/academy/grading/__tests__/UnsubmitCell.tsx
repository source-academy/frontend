import { mount } from 'enzyme';
import * as React from 'react';

import { mockGradingOverviews as gradingOverviews } from '../../../../mocks/gradingAPI';
import { Role } from '../../../../reducers/states';
import UnsubmitCell, { IUnsubmitCellProps } from '../UnsubmitCell';

// Pre-condition: only Staff and Admin users can view the grading overviews page

// Default props has: submitted submission with group 1D, no user group and Staff user
const defaultUnsubmitCellProps: IUnsubmitCellProps = {
  data: gradingOverviews[2],
  handleUnsubmitSubmission: (submissionId: number) => {},
  group: null,
  role: Role.Staff
};

test('Unsubmit cell does not render for unsubmitted submissions', () => {
  const props = {
    ...defaultUnsubmitCellProps,
    data: { ...gradingOverviews[2], submissionStatus: 'attempted' },
    role: Role.Admin
  };
  const app = <UnsubmitCell {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('*').hostNodes().length).toEqual(0);
});

test("Unsubmit cell does not render for submitted submissions outside of non-Admin user's group", () => {
  const props = {
    ...defaultUnsubmitCellProps,
    group: '1D'
  };
  const app = <UnsubmitCell {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('*').hostNodes().length).toEqual(0);
});

test('Unsubmit cell renders for submitted submissions for Admin users regardless of group', () => {
  const props = {
    ...defaultUnsubmitCellProps,
    role: Role.Admin
  };
  const app = <UnsubmitCell {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('*').hostNodes().length).toBeGreaterThan(0);
  expect(tree.find('.bp3-button').hostNodes()).toHaveLength(1);
  expect(
    tree
      .find('.unsubmit-alert')
      .at(0)
      .prop('isOpen')
  ).toEqual(false);
});

test("Unsubmit cell renders for submitted submissions belonging to a Staff user's group", () => {
  const props = {
    ...defaultUnsubmitCellProps,
    group: '1F'
  };
  const app = <UnsubmitCell {...props} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
  expect(tree.find('*').hostNodes().length).toBeGreaterThan(0);
  expect(tree.find('.bp3-button').hostNodes()).toHaveLength(1);
  expect(
    tree
      .find('.unsubmit-alert')
      .at(0)
      .prop('isOpen')
  ).toEqual(false);
});
