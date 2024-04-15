import { parseQuery } from 'src/commons/utils/QueryHelper';

import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';
import DecoderDelegate from './DecoderDelegate';

class UrlParamsDecoderDelegate implements DecoderDelegate {
  decode(str: string): ParsedIntermediateShareLinkState {
    const qs = parseQuery(str);

    return {
      chap: qs.chap,
      exec: qs.exec,
      files: qs.files,
      isFolder: qs.isFolder,
      tabIdx: qs.tabIdx,
      tabs: qs.tabs?.split(','),
      variant: qs.variant,
      prgrm: qs.prgrm
    };
  }
}

export default UrlParamsDecoderDelegate;
