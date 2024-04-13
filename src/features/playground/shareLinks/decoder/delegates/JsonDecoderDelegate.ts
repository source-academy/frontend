import ShareLinkState from '../../ShareLinkState';
import DecoderDelegate from './DecoderDelegate';

class JsonDecoderDelegate implements DecoderDelegate {
  decode(str: string): ShareLinkState {
    const jsonObject = JSON.parse(str);
    return jsonObject.data;
  }
}

export default JsonDecoderDelegate;
