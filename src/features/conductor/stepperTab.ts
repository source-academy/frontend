/**
 * Shared identifiers for the conductor Stepper and CSE Machine tools' tab-driven evaluator selection.
 *
 * Both tools are reached through their side-content tab rather than the evaluator dropdown: the tab is
 * shown for any conductor language that offers the tool, opening it selects the (otherwise hidden)
 * tool evaluator, and leaving it restores the default evaluator. These constants let the pieces that
 * implement that flow (the Playground wiring and the run saga) agree without magic strings.
 */

/**
 * The side-content tab id contributed by the conductor stepper web plugin. The frontend mirrors this
 * contract (the plugin hardcodes the same id) to gate the legacy REPL/resizing while the stepper tab
 * is active and to drive tab-to-evaluator selection.
 */
export const CONDUCTOR_STEPPER_TAB_ID = 'stepper';

/**
 * The side-content tab id contributed by the conductor environment stepper ("e-stepper") web plugin
 * (`@sourceacademy/web-e-stepper`, which hardcodes the same id). Treated like the Stepper tab — see
 * {@link isConductorStepperTab}.
 */
export const CONDUCTOR_E_STEPPER_TAB_ID = 'e-stepper';

/**
 * Whether a tab is one of the conductor stepper tabs (the Stepper or the E-Stepper). While one is
 * selected the REPL is hidden and the side content is not resizeable (as for the legacy stepper),
 * since the tab shows the program's steps and output itself.
 */
export function isConductorStepperTab(tabId: string | undefined): boolean {
  return tabId === CONDUCTOR_STEPPER_TAB_ID || tabId === CONDUCTOR_E_STEPPER_TAB_ID;
}

/**
 * Capability marking an evaluator as its language's stepper (see `EvaluatorCapability.STEPPER` in the
 * language directory). Evaluators carrying it are hidden from the evaluator dropdown and selected only
 * via the Stepper tab.
 */
export const STEPPER_EVALUATOR_CAPABILITY = 'stepper';

/**
 * Capability marking an evaluator as its language's CSE machine (see `EvaluatorCapability.CSE` in the
 * language directory). Evaluators carrying it are hidden from the evaluator dropdown and selected only
 * via the CSE Machine tab — mirrors `STEPPER_EVALUATOR_CAPABILITY` above. Exactly one evaluator per
 * language should carry this capability; the tab-to-evaluator lookup has no other way to pick the
 * right one.
 */
export const CSE_EVALUATOR_CAPABILITY = 'cse';

/**
 * Capability marking an evaluator as its language's EV3 remote-execution evaluator (see
 * `EvaluatorCapability.EV3` in the language directory). Unlike STEPPER/CSE above, this evaluator is
 * not reached through a side-content tab at all - it's selected by `createEv3Conductor.ts`
 * (resolveEv3EvaluatorPath) purely to find this evaluator's script URL, entirely independent of
 * `state.languageDirectory.selectedEvaluatorId`/the evaluator dropdown. It exists in the directory,
 * carrying this capability, so the EV3 evaluator can be hosted as a live URL like every other
 * evaluator rather than bundled locally - not so it can be picked via the normal selection UI.
 */
export const EV3_EVALUATOR_CAPABILITY = 'ev3';

/**
 * Capability marking an evaluator as its language's environment stepper (see
 * `EvaluatorCapability.E_STEPPER` in the language directory). Like the stepper, hidden from the
 * evaluator dropdown and selected only via its tab (the E-Stepper tab).
 */
export const E_STEPPER_EVALUATOR_CAPABILITY = 'e-stepper';

/**
 * True for evaluators reachable only through their own side-content tab (Stepper/E-Stepper/CSE Machine), or
 * not reachable through ordinary selection UI at all (EV3 - see EV3_EVALUATOR_CAPABILITY above) —
 * hidden from the evaluator dropdown, never a fallback/default. Shared by the Playground's
 * tab-to-evaluator sync effect and the evaluator dropdown's own filtering so both agree on exactly
 * which evaluators are "tool" evaluators.
 */
export function isToolEvaluator(evaluator: { capabilities?: readonly string[] }): boolean {
  return (
    !!evaluator.capabilities?.includes(STEPPER_EVALUATOR_CAPABILITY) ||
    !!evaluator.capabilities?.includes(E_STEPPER_EVALUATOR_CAPABILITY) ||
    !!evaluator.capabilities?.includes(CSE_EVALUATOR_CAPABILITY) ||
    !!evaluator.capabilities?.includes(EV3_EVALUATOR_CAPABILITY)
  );
}
