import { SourceDocumentation } from 'js-slang';
import { deviceTypes } from 'src/features/remoteExecution/RemoteExecutionTypes';

import { externalLibraries } from '../application/types/ExternalTypes';

type DocType = {
  caption: string;
  value: string;
  meta: string;
  docHTML?: string;
};

const externalLibrariesDocumentation: Record<string, DocType[]> = {};

const MAX_CAPTION_LENGTH = 27;

function shortenCaption(name: string): string {
  if (name.length <= MAX_CAPTION_LENGTH) {
    return name;
  }

  return (name = name.substring(0, MAX_CAPTION_LENGTH - 3) + '...');
}

function mapExternalLibraryName(name: string): DocType {
  if (name in SourceDocumentation.ext_lib) {
    const key = name as keyof typeof SourceDocumentation.ext_lib;
    return {
      caption: shortenCaption(key),
      value: key,
      meta: SourceDocumentation.ext_lib[key].meta,
      docHTML: SourceDocumentation.ext_lib[key].description
    };
  } else {
    return {
      caption: shortenCaption(name),
      value: name,
      meta: 'const'
    };
  }
}

for (const [lib, names] of externalLibraries) {
  externalLibrariesDocumentation[lib] = names.map(mapExternalLibraryName);
}

// Add remote device libraries
for (const deviceType of deviceTypes) {
  externalLibrariesDocumentation[deviceType.deviceLibraryName] =
    deviceType.internalFunctions.map(mapExternalLibraryName);
}

const builtinDocumentation: Record<string, DocType[]> = {};

Object.entries(SourceDocumentation.builtins).forEach((chapterDoc: any) => {
  const [chapter, docs] = chapterDoc;
  builtinDocumentation[chapter] = Object.entries(docs).map((entry: any) => {
    const [name, info] = entry;
    return {
      caption: shortenCaption(name),
      value: name,
      meta: info.meta,
      docHTML: info.description
    };
  });
});

export const Documentation = {
  builtins: builtinDocumentation,
  externalLibraries: externalLibrariesDocumentation
};
