import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';

/**
 * Whether `next` is the snapshots of the run that `previous` is the snapshots of, with more of its
 * snapshots: a run that the evaluator sends while it goes on arrives as a longer list every few
 * steps, the earlier snapshots being the very objects that came before. A new run (or the same
 * program run again) comes as snapshots of its own, whatever they say.
 */
export function continuesRun(previous: CseSnapshot[] | null, next: CseSnapshot[]): boolean {
  return (
    previous !== null &&
    previous.length > 0 &&
    next.length >= previous.length &&
    next[0] === previous[0] &&
    next[previous.length - 1] === previous[previous.length - 1]
  );
}
