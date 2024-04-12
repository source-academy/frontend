import ShareLinkState from '../../ShareLinkState';

interface EncoderDelegate {
  encode(state: Partial<ShareLinkState>): string;
}

export default EncoderDelegate;
