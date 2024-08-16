import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';

interface DecoderDelegate {
  decode(str: string): ParsedIntermediateShareLinkState;
}

export default DecoderDelegate;
