import ShareLinkState from "../../ShareLinkState";

interface DecoderDelegate {
    decode(str: string): ShareLinkState;
}

export default DecoderDelegate;
