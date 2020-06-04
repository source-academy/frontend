import { shallow } from 'enzyme';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';

import { mockRouterProps } from '../../mocks/ComponentMocks';
import Application, { ApplicationProps } from '../Application';
import { ExternalLibraryName, ExternalLibraryNames } from '../types/ExternalTypes';

test('Application renders correctly', () => {
  const props: ApplicationProps = {
    ...mockRouterProps('/academy', {}),
    title: 'Cadet',
    currentPlaygroundChapter: 2,
    currentPlaygroundVariant: 'default',
    handleLogOut: () => {},
    currentExternalLibrary: ExternalLibraryNames.NONE,
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
  const app = <Application {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
