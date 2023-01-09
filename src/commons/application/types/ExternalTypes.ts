/**
 * Defined for displaying an external library.
 * @see Library the definition of a Library at AssessmentTypes.ts in an assessment.
 */
export type External = {
  key: number;
  name: ExternalLibraryName;
  symbols: string[];
};

export enum ExternalLibraryName {
  NONE = 'NONE',
  SOUNDS = 'SOUNDS',
  EV3 = 'EV3' // Remote execution device library
}

export type ExternalLibrary = {
  name: ExternalLibraryName;
  symbols: string[];
};

/**
 * Defines which external libraries are available for usage, and what
 * external symbols (exposed functions) are under them.
 */

const libEntries: Array<[ExternalLibraryName, string[]]> = [
  [ExternalLibraryName.NONE, []],
  [ExternalLibraryName.SOUNDS, []]
];

export const externalLibraries: Map<string, string[]> = new Map(libEntries);
