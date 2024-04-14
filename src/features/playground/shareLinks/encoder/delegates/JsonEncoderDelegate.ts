import ShareLinkState from '../../ShareLinkState';
import EncoderDelegate from './EncoderDelegate';

class JsonEncoderDelegate implements EncoderDelegate {
  encode(state: ShareLinkState) {
    return JSON.stringify(state);
  }
}

export default JsonEncoderDelegate;
