import ShareLinkState from '../ShareLinkState';
import DecoderDelegate from './delegates/DecoderDelegate';

/**
 * Decodes the given encodedString with the specified decoder in `decodeWith`.
 */
class ShareLinkStateDecoder {
  encodedString: string;

  constructor(encodedString: string) {
    this.encodedString = encodedString;
  }

  decodeWith(decoderDelegate: DecoderDelegate): ShareLinkState {
    return decoderDelegate.decode(this.encodedString);
  }
}

export default ShareLinkStateDecoder;
