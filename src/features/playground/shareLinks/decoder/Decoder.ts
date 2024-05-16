import { Chapter, Variant } from 'js-slang/dist/types';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { getDefaultFilePath } from 'src/commons/application/ApplicationTypes';
import { convertParamToBoolean, convertParamToInt } from 'src/commons/utils/ParamParseHelper';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

import { ShareLinkState } from '../ShareLinkState';
import DecoderDelegate from './delegates/DecoderDelegate';

/**
 * Decodes the given encodedString with the specified decoder in `decodeWith`.
 */
class ShareLinkStateDecoder {
  encodedString: string;

  constructor(encodedString: string) {
    this.encodedString = encodedString;
  }

  decodeWith(
    decoderDelegate: DecoderDelegate,
    workspaceLocation: WorkspaceLocation
  ): ShareLinkState {
    const parsedObject = decoderDelegate.decode(this.encodedString);

    // For backward compatibility with old share links - 'prgrm' is no longer used.
    const program =
      parsedObject.prgrm === undefined ? '' : decompressFromEncodedURIComponent(parsedObject.prgrm);

    // By default, create just the default file.
    const defaultFilePath = getDefaultFilePath(workspaceLocation);
    const filesObject: Record<string, string> =
      parsedObject.files === undefined
        ? {
            [defaultFilePath]: program
          }
        : parseQuery(decompressFromEncodedURIComponent(parsedObject.files));

    return {
      chap: convertParamToInt(parsedObject.chap) ?? Chapter.SOURCE_1,
      exec: Math.max(convertParamToInt(parsedObject.exec) || 1000, 1000),
      files: filesObject,
      isFolder: convertParamToBoolean(parsedObject.isFolder) ?? false,
      tabIdx: convertParamToInt(parsedObject.tabIdx) ?? 0, // By default, use the first editor tab.
      tabs: parsedObject.tabs?.map(decompressFromEncodedURIComponent) ?? [defaultFilePath], // By default, open a single editor tab containing the default playground file.
      variant: parsedObject.variant as Variant
    };
  }
}

export default ShareLinkStateDecoder;
