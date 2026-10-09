import type { IHostServices } from '@sourceacademy/common-cse-machine';
import { createElement } from 'react';

import CseEnvironmentView from '../cseMachine/CseEnvironmentView';

/**
 * The frontend's CSE machine visualization, lent to the web plugins it loads (see
 * `importAndRegisterWebPlugin`): `createView` draws a snapshot's environments the way the CSE
 * Machine tab does.
 */
export const hostServices: IHostServices = {
  cseDiagram: {
    createView: props => createElement(CseEnvironmentView, props),
  },
};
