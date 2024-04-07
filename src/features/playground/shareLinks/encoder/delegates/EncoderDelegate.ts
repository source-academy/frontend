import ShareLinkState from "../../ShareLinkState";

interface EncoderDelegate {
    encode(state: ShareLinkState): string;
}

export default EncoderDelegate;
