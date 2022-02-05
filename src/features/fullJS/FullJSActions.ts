import { action } from 'typesafe-actions';

import { FULL_JS_RUN, FullJSEvalPayload } from './FullJSTypes';

export const fullJSRun = (runPayload: FullJSEvalPayload) => action(FULL_JS_RUN, runPayload);
