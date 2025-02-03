import { BasicHostPlugin } from "sa-conductor/dist/conductor/host";
import { IConduit } from "sa-conductor/dist/conduit";

export class BrowserHostPlugin extends BasicHostPlugin {
    requestFile: (fileName: string) => Promise<string | undefined>;

    init(conduit: IConduit, channels: any): void {
        super.init(conduit, channels);
        console.log("browser-inited");
    }

    constructor(onRequestFile: (fileName: string) => Promise<string | undefined>) {
        super();
        this.requestFile = onRequestFile;
    }
}
