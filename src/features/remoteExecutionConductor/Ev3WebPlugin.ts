import type { IChannel, IConduit, IPlugin } from '@sourceacademy/conductor/conduit';

// Must match the worker plugin's own channelAttach (see py-slang's EV3 engine /
// public/evaluators/ev3-remote-runner.js) - 'test' was a placeholder left over from before that
// worker existed, so the host and worker were attaching to different channels and every message
// silently went nowhere (no error either side, since Conductor doesn't fail a send when nothing
// is subscribed on the target channel - it just never gets delivered).
const CHANNEL_ID = 'ev3-execution';

export type PySlangMessage =
  | { type: 'run'; code: string }
  | { type: 'result'; output: string }
  | { type: 'error'; message: string };

const WEB_ID = '__web_ev3_host';

export class Ev3WebPlugin implements IPlugin {
  readonly id: string = WEB_ID;
  static readonly channelAttach = [CHANNEL_ID];

  private readonly __channel: IChannel<PySlangMessage>;

  onResult?: (output: string) => void;
  onError?: (message: string) => void;

  constructor(_conduit: IConduit, [channel]: IChannel<any>[]) {
    this.__channel = channel;

    this.__channel.subscribe((message: PySlangMessage) => {
      if (message.type === 'result') {
        this.onResult?.(message.output);
      } else if (message.type === 'error') {
        this.onError?.(message.message);
      }
    });
  }

  run(code: string): void {
    this.__channel.send({ type: 'run', code });
  }
}
