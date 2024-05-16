import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';
import DecoderDelegate from './DecoderDelegate';

class JsonDecoderDelegate implements DecoderDelegate {
  decode(str: string): ParsedIntermediateShareLinkState {
    return JSON.parse(str);
  }
}

export default JsonDecoderDelegate;
