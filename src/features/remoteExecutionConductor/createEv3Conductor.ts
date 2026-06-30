import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';

import { Ev3WebPlugin } from './Ev3WebPlugin';

const EV3_EVALUATOR_PATH = '/evaluators/ev3-remote-runner.js';

export function createEv3Conductor(
  client: SlingClient,
): { plugin: Ev3WebPlugin; conduit: IConduit } {
  const worker = new Worker(EV3_EVALUATOR_PATH);
  const conduit = new Conduit(worker, true);

  const plugin = conduit.registerPlugin(Ev3WebPlugin);

  plugin.onResult = (svml: string) => {
    client.sendRun(Buffer.from(svml));
  };

  plugin.onError = (message: string) => {
    console.error('EV3 evaluator error:', message);
  };

  return { plugin, conduit };
}
