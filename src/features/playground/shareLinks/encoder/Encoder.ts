import ShareLinkState from '../ShareLinkState';
import EncoderDelegate from './delegates/EncoderDelegate';

/**
 * Creates a snapshot of the current ShareLinkState during instantiation.
 * Use `encodeWith(encoderDelegate)` to output an encoding of this state snapshot.
 */
class ShareLinkStateEncoder {
  state: Partial<ShareLinkState>;

  constructor() {
    this.state = this.getState();
  }

  encodeWith(encoderDelegate: EncoderDelegate): string {
    return encoderDelegate.encode(this.state);
  }

  private getState(): Partial<ShareLinkState> {
    // TODO: Implement
    return {};
  }
}

export default ShareLinkStateEncoder;
