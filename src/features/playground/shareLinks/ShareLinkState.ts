import { Chapter, Variant } from "js-slang/dist/types";

import { ExternalLibraryName } from "../../../commons/application/types/ExternalTypes";

type ShareLinkState = {
    // TODO: Double check
    isFolder: boolean;
    files: string;
    tabs: string[];
    tabIdx: number | null;
    chap: Chapter;
    variant: Variant;
    ext: ExternalLibraryName;
    exec: number;
}

export default ShareLinkState;
