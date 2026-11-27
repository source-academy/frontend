import type { IHostContract } from '@sourceacademy/common-tabs';

import { editorService } from './editorService';

/**
 * What the frontend lends to the web plugins it loads, as the last argument of their constructor
 * (see `importAndRegisterWebPlugin`): the host contract of `@sourceacademy/common-tabs`. It names no
 * tool and no language; a plugin that does not use a part of it ignores it.
 */
export const hostContract: IHostContract = {
  editor: editorService,
};
