import qs from 'query-string';

import { ParsedIntermediateShareLinkState } from '../../ShareLinkState';
import EncoderDelegate from './EncoderDelegate';

class UrlParamsEncoderDelegate implements EncoderDelegate {
  encode(state: ParsedIntermediateShareLinkState): string {
    return qs.stringify(state);
  }
}

export default UrlParamsEncoderDelegate;
