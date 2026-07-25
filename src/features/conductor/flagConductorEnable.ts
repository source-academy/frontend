import { useLocation } from 'react-router';

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

/** '/sicpjs/...' snippets never select a Conductor evaluator (see `selectConductorEnable` below). */
const isSicpJsRoute = (pathname: string) => pathname.startsWith('/sicpjs');

/**
 * The SICP JS textbook's inline runnable snippets ('/sicpjs/...') and SICPy's ('/sicpy/...')
 * share the same 'sicp' workspace location and Playground component, so nothing in Redux state
 * distinguishes them. Only SICP JS is affected here: its snippets are configured via the legacy
 * Source-chapter dispatch (playgroundConfigLanguage), which never selects a Conductor evaluator,
 * because Source itself hasn't been migrated into the Language Directory yet. SICPy's snippets
 * already select a real Conductor evaluator and work fine either way.
 *
 * Every consumer of this flag (eval routing, CSE/Stepper tab visibility, editor mode selection,
 * evaluator id lookups, welcome text, ...) needs to agree SICP JS is non-Conductor, not just eval
 * routing alone, otherwise the UI ends up in an inconsistent state (e.g. showing Conductor-only
 * tabs while actually running the legacy evaluator). Centralizing the override here, at the
 * single selector every consumer already goes through, keeps that consistent without having to
 * chase down every call site individually.
 *
 * This deliberately does NOT touch the persisted `modifiedFlags` state or the value shown on the
 * /features page. It's a pure, unpersisted, per-render override computed fresh from the current
 * route, so leaving SICP JS for any other page takes effect immediately with no reset step, and
 * the user's actual flag preference is never mutated.
 *
 * Note on purity: this reads `window.location` instead of Redux state, so on its own it isn't
 * reactive to client-side navigation, a component only picks up the new value the next time it
 * happens to re-render for some other reason. `useConductorEnable()` below fixes this properly
 * for React consumers by subscribing to route changes through `useLocation()`. The remaining
 * direct callers of this raw selector (Playground.tsx, SideContentCseMachine.tsx's
 * mapStateToProps, and the sagas under commons/sagas/) are fine today only because they all sit
 * inside the Playground route tree, which fully unmounts and remounts on navigation into or out
 * of '/sicpjs' (sagas read it once synchronously at dispatch time anyway, so this doesn't apply
 * to them). We're not chasing every one of those call sites onto the same useLocation() pattern
 * right now: this whole override is a stopgap that goes away once Source is migrated into the
 * Language Directory, which is expected within the next few months, so it isn't worth the extra
 * surface area (rewriting a connect()-based component's mapStateToProps, five saga call sites,
 * and six inline selectors in Playground.tsx) for something this short lived. If a call site ever
 * gets pulled out of that remounting tree or memoized before the migration lands, it will need
 * the same route-subscription treatment as useConductorEnable().
 *
 * Remove this override once Source is migrated into the Language Directory.
 */
export const selectConductorEnable = (state: OverallState) => {
  if (isSicpJsRoute(window.location.pathname)) {
    return false;
  }
  return selectConductorEnableFlag(state);
};

/**
 * Use this instead of `useFeature(flagConductorEnable)` everywhere, the latter reads
 * `modifiedFlags` directly and bypasses the SICP JS override above entirely, which is exactly
 * why the editor's syntax highlighting (Editor.tsx) and a few other UI bits stayed in Conductor
 * mode on SICP JS even with the override in place.
 *
 * Unlike `selectConductorEnable`, this subscribes to route changes through `useLocation()`
 * (React Router's actual reactivity primitive for navigation) instead of relying on the
 * enclosing component happening to re-render for some unrelated reason.
 */
export const useConductorEnable = (): boolean => {
  const { pathname } = useLocation();
  const flagEnabled = useAppSelector(selectConductorEnableFlag);
  return isSicpJsRoute(pathname) ? false : flagEnabled;
};
