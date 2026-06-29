import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';

import { BrowserHostPlugin } from '../conductor/BrowserHostPlugin';

export const EV3_EVALUATOR_PATH = '/evaluators/ev3-pyslang.js';

export function createEv3Conductor(
  client: SlingClient,
  onRequestFile: (fileName: string) => Promise<string | undefined>,
  onRequestLoadPlugin: (pluginName: string) => void,
): { hostPlugin: BrowserHostPlugin; conduit: IConduit } {
  const worker = new Worker(EV3_EVALUATOR_PATH);
  const conduit = new Conduit(worker, true);

  const hostPlugin = conduit.registerPlugin(
    BrowserHostPlugin,
    onRequestFile,
    onRequestLoadPlugin,
  );

  // When the EV3 evaluator sends back compiled SVML, forward it to the EV3
  hostPlugin.receiveResult = (svml: string) => {
    client.sendRun(Buffer.from(svml));
  };

  return { hostPlugin, conduit };
}
