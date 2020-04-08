import { SourceDocumentation } from 'js-slang';
import { externalLibraries } from './externalLibraries';

const externalLibrariesDocumentation = {};

const MAX_CAPTION_LENGTH = 25;

function shortenCaption(name: string): string {
  if (name.length <= MAX_CAPTION_LENGTH) {
    return name;
  }

  return (name = name.substring(0, MAX_CAPTION_LENGTH - 3) + '...');
}

for (const [lib, names] of externalLibraries) {
  const libDocs = names.map((name: string) => {
    if (name in SourceDocumentation.ext_lib) {
      return {
        caption: shortenCaption(name),
        value: name,
        meta: SourceDocumentation.ext_lib[name].meta,
        docHTML: SourceDocumentation.ext_lib[name].description
      };
    } else {
      return {
        caption: shortenCaption(name),
        value: name,
        meta: 'const'
      };
    }
  });

  externalLibrariesDocumentation[lib] = libDocs;
}

const builtinDocumentation = {};

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
