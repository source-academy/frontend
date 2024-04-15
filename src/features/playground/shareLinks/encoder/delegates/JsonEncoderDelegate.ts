import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';
import EncoderDelegate from './EncoderDelegate';

class JsonEncoderDelegate implements EncoderDelegate {
  encode(state: ParsedIntermediateShareLinkState) {
    return JSON.stringify(state);
  }
}

export default JsonEncoderDelegate;
