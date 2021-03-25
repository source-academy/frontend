import { mount } from 'enzyme';
import * as React from 'react';
import { AssessmentStatuses } from 'src/commons/assessment/AssessmentTypes';

import SideContentContestVotingContainer from '../SideContentContestVotingContainer';

const mockContestEntries = [
  {
    submission_id: 1,
    answer: { code: "display('hello world')" },
    score: 1
  },
  {
    submission_id: 2,
    answer: { code: 'function test() { return 1; }' },
    score: 2
  }
];

const mockProps = {
  handleContestEntryClick: () => null,
  handleSave: () => null,
  assessmentStatus: AssessmentStatuses.attempting,
  contestEntries: mockContestEntries
};

// Basic snapshot testing
test('SideContentContestVotingContainer component renders correctly for unsubmit status.', () => {
  const contestVotingContainer = <SideContentContestVotingContainer {...mockProps} />;
  const tree = mount(contestVotingContainer);
  expect(tree.debug()).toMatchSnapshot();

  const additionalContestEntry = [
    ...mockContestEntries,
    { submission_id: 3, answer: { code: '' } }
  ];
  // check that number of elements in list is based on contest entries
  tree.setProps({ contestEntries: additionalContestEntry });
  expect(tree.find('SideContentContestEntryCard')).toHaveLength(3);
});

const mockPropsSubmitted = {
  handleContestEntryClick: () => null,
  handleSave: () => null,
  assessmentStatus: AssessmentStatuses.attempting,
  contestEntries: [
    {
      submission_id: 1,
      answer: { code: "display('hello world')" },
      score: 1
    },
    {
      submission_id: 2,
      answer: { code: 'function test() { return 1; }' },
      score: 2
    }
  ]
};

test('SideContentVotingContainer component renders correctly for submitted status.', () => {
  const contestVotingContainerSubmitted = (
    <SideContentContestVotingContainer {...mockPropsSubmitted} />
  );
  const tree = mount(contestVotingContainerSubmitted);
  expect(tree.debug()).toMatchSnapshot();

  tree.unmount();
});
