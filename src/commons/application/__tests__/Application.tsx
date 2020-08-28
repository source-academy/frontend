import { shallow } from 'enzyme';
import { Variant } from 'js-slang/dist/types';
import moment from 'moment';
import * as React from 'react';
import Constants from 'src/commons/utils/Constants';

import { mockRouterProps } from '../../mocks/ComponentMocks';
import Application, { ApplicationProps } from '../Application';
import { ExternalLibraryName } from '../types/ExternalTypes';

const props: ApplicationProps = {
  ...mockRouterProps('/academy', {}),
  title: 'Cadet',
  currentPlaygroundChapter: 2,
  currentPlaygroundVariant: 'default',
  handleLogOut: () => {},
  currentExternalLibrary: ExternalLibraryName.NONE,
  handleClearContext: (
    chapter: number,
    variant: Variant,
    externalLibraryName: ExternalLibraryName
  ) => {},
  handleEditorValueChange: (val: string) => {},
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => {},
  handleEnsureLibrariesLoaded: () => {},
  handleExternalLibrarySelect: (externalLibraryName: ExternalLibraryName) => {},
  handleSetExecTime: (execTime: string) => {}
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
