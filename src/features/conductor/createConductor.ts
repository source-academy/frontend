import { Conduit, IConduit } from "sa-conductor/dist/conduit";
import { BrowserHostPlugin } from "./BrowserHostPlugin";

export function createConductor(evaluatorPath: string, onRequestFile: (fileName: string) => Promise<string | undefined>): { hostPlugin: BrowserHostPlugin, conduit: IConduit } {
    const worker = new Worker(evaluatorPath);
    const hostPlugin = new BrowserHostPlugin(onRequestFile);
    const conduit = new Conduit(worker, true);
    conduit.registerPlugin(hostPlugin);
    return { hostPlugin, conduit };
}
