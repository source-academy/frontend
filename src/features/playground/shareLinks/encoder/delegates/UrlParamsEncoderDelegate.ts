import qs from 'query-string';

import ShareLinkState from "../../ShareLinkState";
import EncoderDelegate from "./EncoderDelegate";

class UrlParamsEncoderDelegate implements EncoderDelegate {
    encode(state: ShareLinkState): string {
        return qs.stringify(state);
    }
}

export default UrlParamsEncoderDelegate;
