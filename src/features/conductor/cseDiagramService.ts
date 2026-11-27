import type { IHostServices } from '@sourceacademy/common-cse-machine';
import type { IHostContract } from '@sourceacademy/common-tabs';
import { createElement } from 'react';

import CseEnvironmentView from '../cseMachine/CseEnvironmentView';
import { editorService } from './editorService';

/**
 * The frontend's CSE machine visualization, lent to the web plugins it loads (see
 * `importAndRegisterWebPlugin`): `createView` draws a snapshot's environments the way the CSE
 * Machine tab does.
 */
export const hostServices: IHostServices & IHostContract = {
  editor: editorService,
  cseDiagram: {
    createView: props => createElement(CseEnvironmentView, props),
  },
};
