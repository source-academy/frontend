import ShareLinkState from "../ShareLinkState";
import EncoderDelegate from "./delegates/EncoderDelegate";

/**
 * Creates a snapshot of the current ShareLinkState during instantiation.
 * Use `encodeWith(encoderDelegate)` to output an encoding of this state snapshot.
 */
class ShareLinkStateEncoder {
    state: ShareLinkState;

    constructor() {
        this.state = this.getState();
    }

    encodeWith(encoderDelegate: EncoderDelegate): string {
        return encoderDelegate.encode(this.state);
    }

    private getState(): ShareLinkState {
        // TODO: Implement
    }
}

export default ShareLinkStateEncoder;
