import { CHANNEL_ID, type PySlangMessage } from '@sourceacademy/common-test';
import type { IChannel, IConduit, IPlugin } from '@sourceacademy/conductor/conduit';

const WEB_ID = '__web_test';

export class Ev3WebPlugin implements IPlugin {
  readonly id: string = WEB_ID;
  static readonly channelAttach = [CHANNEL_ID];

  private readonly __channel: IChannel<PySlangMessage>;

  onResult?: (output: string) => void;
  onError?: (message: string) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
