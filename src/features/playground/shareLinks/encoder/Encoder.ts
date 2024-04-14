import ShareLinkState from '../ShareLinkState';
import EncoderDelegate from './delegates/EncoderDelegate';

class ShareLinkStateEncoder {
  state: ShareLinkState;

  constructor(state: ShareLinkState) {
    this.state = state;
  }

  encodeWith(encoderDelegate: EncoderDelegate): string {
    return encoderDelegate.encode(this.state);
  }
}

export default ShareLinkStateEncoder;
