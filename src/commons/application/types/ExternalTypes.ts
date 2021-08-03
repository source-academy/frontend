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
  RUNES = 'RUNES',
  CURVES = 'CURVES',
  SOUNDS = 'SOUNDS',
  BINARYTREES = 'BINARYTREES',
  PIXNFLIX = 'PIXNFLIX',
  MACHINELEARNING = 'MACHINELEARNING',
  EV3 = 'EV3', // Remote execution device library
  ALL = 'ALL'
}

export type ExternalLibrary = {
  name: ExternalLibraryName;
  symbols: string[];
};

const runesLibrary = [
  'show',
  'color',
  'random_color',
  'red',
  'pink',
  'purple',
  'indigo',
  'blue',
  'green',
  'yellow',
  'orange',
  'brown',
  'black',
  'white',
  'scale_independent',
  'scale',
  'translate',
  'rotate',
  'stack_frac',
  'stack',
  'stackn',
  'quarter_turn_right',
  'quarter_turn_left',
  'turn_upside_down',
  'beside_frac',
  'beside',
  'flip_vert',
  'flip_horiz',
  'make_cross',
  'repeat_pattern',
  'square',
  'blank',
  'rcross',
  'sail',
  'corner',
  'nova',
  'circle',
  'heart',
  'pentagram',
  'ribbon',
  'anaglyph',
  'overlay_frac',
  'overlay',
  'hollusion', // currently not documented; animation not working
  'picture_mse'
];

const soundsLibrary = [
  'make_sound',
  'get_wave',
  'get_duration',
  'is_sound',
  'play',
  'play_concurrently',
  'stop',
  'consecutively',
  'simultaneously',
  'noise_sound',
  'sine_sound',
  'silence_sound',
  'letter_name_to_midi_note',
  'letter_name_to_frequency',
  'midi_note_to_frequency',
  'square_sound',
  'triangle_sound',
  'sawtooth_sound',
  'play_unsafe', // undocumented
  'display_waveform', // undocumented
  /** Microphone Sounds */
  'init_record',
  'record',
  'record_for',
  /** Contest functions */
  'adsr',
  'stacking_adsr',
  'trombone',
  'piano',
  'bell',
  'violin',
  'cello'
];

const binaryTreesLibrary = [
  'make_empty_tree',
  'is_tree',
  'make_tree',
  'is_empty_tree',
  'entry',
  'left_branch',
  'right_branch'
];

const videoLibrary = [
  'red_of',
  'green_of',
  'blue_of',
  'alpha_of',
  'set_rgba',
  'copy_image',
  'compose_filter',
  'install_filter',
  'reset_filter',
  'video_height',
  'video_width'
];

const machineLearningLibrary = [
  'init_webcam',
  'train_recognition',
  'load_faceapi',
  'change_label',
  'array_push',
  'normalise_data'
];

/**
 * Defines which external libraries are available for usage, and what
 * external symbols (exposed functions) are under them.
 */

const libEntries: Array<[ExternalLibraryName, string[]]> = [
  [ExternalLibraryName.NONE, []],
  [ExternalLibraryName.RUNES, runesLibrary],
  [ExternalLibraryName.CURVES, []],
  [ExternalLibraryName.SOUNDS, soundsLibrary],
  [ExternalLibraryName.BINARYTREES, binaryTreesLibrary],
  [ExternalLibraryName.PIXNFLIX, videoLibrary],
  [ExternalLibraryName.MACHINELEARNING, machineLearningLibrary],
  [ExternalLibraryName.ALL, runesLibrary.concat(soundsLibrary, binaryTreesLibrary, videoLibrary)]
];

export const externalLibraries: Map<string, string[]> = new Map(libEntries);
