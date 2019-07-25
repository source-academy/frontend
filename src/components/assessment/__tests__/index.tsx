import { mount } from 'enzyme';
import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { Provider } from 'react-redux';
import Assessment, { IAssessmentProps } from '../';
import { store } from '../../../createStore';
import { mockAssessmentOverviews } from '../../../mocks/assessmentAPI';
import { mockRouterProps } from '../../../mocks/components';
import { AssessmentCategories } from '../assessmentShape';

const defaultProps: IAssessmentProps = {
  assessmentCategory: AssessmentCategories.Mission,
  assessmentOverviews: undefined,
  handleAcknowledgeNotifications: () => {},
  handleAssessmentOverviewFetch: () => {},
  handleSubmitAssessment: (id: number) => {},
  isStudent: false,
  ...mockRouterProps('/academy/missions', {})
};

const mockUndefinedAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: undefined
};

const mockEmptyAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: []
};

const mockPresentAssessment: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews
};

const mockPresentAssessmentForStudent: IAssessmentProps = {
  ...defaultProps,
  assessmentOverviews: mockAssessmentOverviews,
  isStudent: true
};

test('Assessment page "loading" content renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockUndefinedAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page with 0 missions renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockEmptyAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page with multiple loaded missions renders correctly', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockPresentAssessment} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Assessment page does not show attempt Button for upcoming assessments for student user', () => {
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <Assessment {...mockPresentAssessmentForStudent} />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
