import ShareLinkState from '../../ShareLinkState';

interface DecoderDelegate {
  decode(str: string): Partial<ShareLinkState>;
}

export default DecoderDelegate;
