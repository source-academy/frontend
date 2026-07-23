import type { OverallState } from '../../commons/application/ApplicationTypes';
import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import { useAppSelector } from '../../commons/utils/Hooks';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  true,
  'Enables the Conductor framework for evaluation of user programs.',
);

const selectConductorEnableFlag = featureSelector(flagConductorEnable);

/**
 * The SICP JS textbook's inline runnable snippets ('/sicpjs/...') and SICPy's ('/sicpy/...')
 * share the same 'sicp' workspace location and Playground component, so nothing in Redux state
 * distinguishes them — but only SICP JS is affected here: its snippets are configured via the
 * legacy Source-chapter dispatch (playgroundConfigLanguage), which never selects a Conductor
 * evaluator, because Source itself hasn't been migrated into the Language Directory yet.
 * SICPy's snippets already select a real Conductor evaluator and work fine either way.
 *
 * Every consumer of this flag (eval routing, CSE/Stepper tab visibility, editor mode selection,
 * evaluator id lookups, welcome text, ...) needs to agree SICP JS is non-Conductor, not just eval
 * routing alone — otherwise the UI ends up in an inconsistent state (e.g. showing Conductor-only
 * tabs while actually running the legacy evaluator). Centralizing the override here, at the
 * single selector every consumer already goes through, keeps that consistent without having to
 * chase down every call site individually.
 *
 * This deliberately does NOT touch the persisted `modifiedFlags` state or the value shown on the
 * /features page — it's a pure, unpersisted, per-render override computed fresh from the current
 * route, so leaving SICP JS for any other page takes effect immediately with no reset step, and
 * the user's actual flag preference is never mutated.
 *
 * Remove this override once Source is migrated into the Language Directory.
 */
export const selectConductorEnable = (state: OverallState) => {
  if (window.location.pathname.startsWith('/sicpjs')) {
    return false;
  }
  return selectConductorEnableFlag(state);
};

/**
 * Use this instead of `useFeature(flagConductorEnable)` everywhere — the latter reads
 * `modifiedFlags` directly and bypasses the SICP JS override above entirely, which is exactly
 * why the editor's syntax highlighting (Editor.tsx) and a few other UI bits stayed in Conductor
 * mode on SICP JS even with the override in place.
 */
export const useConductorEnable = (): boolean => useAppSelector(selectConductorEnable);
