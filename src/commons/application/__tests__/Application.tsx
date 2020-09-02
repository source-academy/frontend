import { shallow } from 'enzyme';
import moment from 'moment';
import * as React from 'react';
import Constants from 'src/commons/utils/Constants';

import { mockRouterProps } from '../../mocks/ComponentMocks';
import Application, { ApplicationProps } from '../Application';

const props: ApplicationProps = {
  ...mockRouterProps('/academy', {}),
  title: 'Cadet',
  handleLogOut: () => {}
};

test('Application renders correctly', () => {
  const app = <Application {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Application shows disabled when in disabled period', () => {
  const origPeriods = Constants.disablePeriods;
  const now = moment();
  Constants.disablePeriods = [
    {
      start: now.clone().subtract(1, 'minute'),
      end: now.clone().add(1, 'minute'),
      reason: 'Testing'
    }
  ];

  const app = <Application {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();

  Constants.disablePeriods = origPeriods;
});
