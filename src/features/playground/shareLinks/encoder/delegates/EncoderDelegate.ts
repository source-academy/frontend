import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';

interface EncoderDelegate {
  encode(state: ParsedIntermediateShareLinkState): string;
}

export default EncoderDelegate;
