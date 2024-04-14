// alternate representations of data types

import { ControlItem } from 'js-slang/dist/cse-machine/types';
import { Chapter, Node } from 'js-slang/dist/types';
import { isSchemeLanguage } from 'src/commons/application/ApplicationTypes';

import { ControlItemComponent } from '../components/ControlItemComponent';
import { Data } from '../CseMachineTypes';
import { convertNodeToScheme, isSchemeNumber } from './scheme';

// used to define custom primitives from alternate languages.
// MAKE SURE the custom primitive has a toString() method!
export function isCustomPrimitive(data: Data): boolean {
  return isSchemeNumber(data);
}

// tells the CSE machine whether a new representation is needed.
// expand when necessary.
export function needsNewRepresentation(chapter: Chapter): boolean {
  return isSchemeLanguage(chapter);
}

export function getAlternateControlItemComponent(
  controlItem: ControlItem,
  stackHeight: number,
  highlightOnHover: () => void,
  unhighlightOnHover: () => void,
  topItem: boolean,
  chapter: Chapter
) {
  // keep in mind that the controlItem is a node.
  // there's no reason to provide an alternate representation
  // for a instruction.
  const node = controlItem as Node;
  switch (chapter) {
    case Chapter.SCHEME_1:
    case Chapter.SCHEME_2:
    case Chapter.SCHEME_3:
    case Chapter.SCHEME_4:
    case Chapter.FULL_SCHEME:
      const text = convertNodeToScheme(node);
      return new ControlItemComponent(
        text,
        text,
        stackHeight,
        highlightOnHover,
        unhighlightOnHover,
        topItem
      );
    default:
      // this only happens if
      // a chapter needing an alternate representation
      // is not handled.
      throw new Error('Unknown Chapter');
  }
}
