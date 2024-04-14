import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';

import { ParsedIntermediateShareLinkState, ShareLinkState } from '../ShareLinkState';
import EncoderDelegate from './delegates/EncoderDelegate';

class ShareLinkStateEncoder {
  state: ShareLinkState;

  constructor(state: ShareLinkState) {
    this.state = state;
  }

  encodeWith(encoderDelegate: EncoderDelegate): string {
    const processedState: ParsedIntermediateShareLinkState = {
      isFolder: this.state.isFolder.toString(),
      tabIdx: this.state.tabIdx?.toString() ?? '',
      chap: this.state.chap.toString(),
      variant: this.state.variant,
      exec: this.state.exec.toString(),
      tabs: this.state.tabs.map(compressToEncodedURIComponent),
      files: compressToEncodedURIComponent(qs.stringify(this.state.files))
    };
    return encoderDelegate.encode(processedState);
  }
}

export default ShareLinkStateEncoder;
