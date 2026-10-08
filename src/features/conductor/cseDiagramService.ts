import { createElement } from 'react';

import CseEnvironmentView, { type CseEnvironmentViewProps } from '../cseMachine/CseEnvironmentView';

/**
 * The frontend's CSE machine visualization, lent to the web plugins it loads (see
 * `importAndRegisterWebPlugin`): `createView` draws a snapshot's environments the way the CSE
 * Machine tab does. Mirrors `ICseDiagramService`/`IHostServices` from
 * `@sourceacademy/common-cse-machine` (plugins#133), which the frontend can import once a version
 * with them is released.
 */
export interface ICseDiagramService {
  createView(props: CseEnvironmentViewProps): unknown;
}

export interface IHostServices {
  cseDiagram?: ICseDiagramService;
}

export const hostServices: IHostServices = {
  cseDiagram: {
    createView: props => createElement(CseEnvironmentView, props),
  },
};
