import { IParsedQuery, parseQuery } from 'src/commons/utils/QueryHelper';

import ShareLinkState from '../../ShareLinkState';
import DecoderDelegate from './DecoderDelegate';

class UrlParamsDecoderDelegate implements DecoderDelegate {
  decode(str: string): Partial<ShareLinkState> {
    const qs: Partial<IParsedQuery> = parseQuery(str);
    return {
      chap: qs.chap,
      exec: qs.exec,
      files: qs.files,
      isFolder: qs.isFolder,
      tabIdx: qs.tabIdx,
      tabs: qs.tabs,
      variant: qs.variant,
      prgrm: qs.prgrm,
      ext: qs.ext
    };
  }
}

export default UrlParamsDecoderDelegate;
