/**
 * Evaluators that are not for running a program in the editor, and so are kept out of the evaluator
 * dropdown.
 *
 * An evaluator that names a `plugin` in the language directory is reached through that plugin's tab
 * (see `features/directory/toolTabs.ts`). The two below predate that: the CSE machine's tab is still
 * built by the frontend (until it is a plugin, source-academy/plugins#194), and the EV3 evaluator is
 * reached through remote execution. Both are marked by a capability instead.
 */

/**
 * Capability marking an evaluator as its language's CSE machine (see `EvaluatorCapability.CSE` in the
 * language directory). Evaluators carrying it are hidden from the evaluator dropdown and selected only
 * via the CSE Machine tab. Exactly one evaluator per language should carry this capability; the
 * tab-to-evaluator lookup has no other way to pick the right one.
 */
export const CSE_EVALUATOR_CAPABILITY = 'cse';

/**
 * Capability marking an evaluator as its language's EV3 remote-execution evaluator (see
 * `EvaluatorCapability.EV3` in the language directory). Unlike the CSE machine's, this evaluator is
 * not reached through a side-content tab at all - it's selected by `createEv3Conductor.ts`
 * (resolveEv3EvaluatorPath) purely to find this evaluator's script URL, entirely independent of
 * `state.languageDirectory.selectedEvaluatorId`/the evaluator dropdown. It exists in the directory,
 * carrying this capability, so the EV3 evaluator can be hosted as a live URL like every other
 * evaluator rather than bundled locally - not so it can be picked via the normal selection UI.
 */
export const EV3_EVALUATOR_CAPABILITY = 'ev3';

/**
 * True for evaluators reachable only through a side-content tab of their own (one that names a plugin,
 * or the CSE machine), or not reachable through ordinary selection UI at all (EV3): hidden from the
 * evaluator dropdown, never a fallback/default. Shared by the Playground's tab-to-evaluator sync effect
 * and the evaluator dropdown's own filtering so both agree on exactly which evaluators these are.
 */
export function isToolEvaluator(evaluator: {
  plugin?: string;
  capabilities?: readonly string[];
}): boolean {
  return (
    !!evaluator.plugin ||
    !!evaluator.capabilities?.includes(CSE_EVALUATOR_CAPABILITY) ||
    !!evaluator.capabilities?.includes(EV3_EVALUATOR_CAPABILITY)
  );
}
