/**
 * Ace modes that must be registered before an editor session can use them.
 *
 * Conductor evaluators describe their own highlighting (see `features/conductor/AutocompletePlugin.ts`),
 * but that description refers to Ace's stock modes for folding, indentation and outdentation: Source
 * hooks into `javascript` and `folding/cstyle`, Python into `python` (imported by the plugin itself).
 * The remaining modes are used directly via a language's `editorConfig.aceMode`.
 */
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-typescript';
