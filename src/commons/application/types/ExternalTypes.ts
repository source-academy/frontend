/**
 * Defined for displaying an external library.
 * @see Library the definition of a Library at AssessmentTypes.ts in an assessment.
 */
export type External = {
    key: number;
    name: ExternalLibraryName;
    symbols: string[];
};

export enum ExternalLibraryNames {
    NONE = 'NONE',
    RUNES = 'RUNES',
    CURVES = 'CURVES',
    SOUNDS = 'SOUNDS',
    BINARYTREES = 'BINARYTREES',
    PIXNFLIX = 'PIX&FLIX',
    MACHINELEARNING = 'MACHINELEARNING',
    ALL = 'ALL'
}

export type ExternalLibraryName = (typeof ExternalLibraryNames)[keyof typeof ExternalLibraryNames];

export type ExternalLibrary = {
    name: ExternalLibraryName;
    symbols: string[];
};

