import {
  ExternalLibraryName,
  ExternalLibraryNames
} from '../components/assessment/assessmentShape';

/**
 * Defines which external libraries are available for usage, and what
 * external symbols (exposed functions) are under them.
 */

const libEntries: Array<[ExternalLibraryName, string[]]> = [
  [ExternalLibraryNames.NONE, []],
  [
    ExternalLibraryNames.RUNES,
    [
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
      'hollusion' // currently not documented; animation not working
    ]
  ],
  [
    ExternalLibraryNames.CURVES,
    [
      'make_point',
      'draw_points_on',
      'draw_connected',
      'draw_points_squeezed_to_window',
      'draw_connected_squeezed_to_window',
      'draw_connected_full_view',
      'draw_connected_full_view_proportional',
      'x_of',
      'y_of',
      'unit_line',
      'unit_line_at',
      'unit_circle',
      'connect_rigidly',
      'connect_ends',
      'put_in_standard_position',
      'translate',
      'scale',
      /** Contest functions */
      'rotate_pi_over_2',
      'scale_x_y',
      'gosperize',
      'gosper_curve',
      'show_connected_gosper',
      'repeated',
      'param_gosper',
      'param_gosperize',
      'rotate_around_origin',
      'arc', // used in GOSPERIZE
      'invert', // used in DRAGONIZE
      'alternative_unit_circle', // undocumented
      'full_view_proportional', // undocumented
      'squeeze_full_view', // undocumented
      'squeeze_rectangular_portion' // undocumented
    ]
  ],
  [
    ExternalLibraryNames.SOUNDS,
    [
      'make_sound',
      'get_wave',
      'get_duration',
      'play',
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
      'play_unsafe',
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
    ]
  ],
  [
    ExternalLibraryNames.BINARYTREES,
    [
      'make_empty_tree',
      'is_tree',
      'make_tree',
      'is_empty_tree',
      'entry',
      'left_branch',
      'right_branch'
    ]
  ]
];

export const externalLibraries: Map<string, string[]> = new Map(libEntries);
