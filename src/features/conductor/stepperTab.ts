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
