import type { ITabService, Tab } from '@sourceacademy/common-tabs';

import sideContentManager from '../../commons/sideContent/SideContentManager';

/**
 * Per-conductor {@link ITabService} that buffers a conductor's side-content tab registrations and
 * forwards them to the global {@link sideContentManager} only while that conductor is the *active*
 * one (the conductor currently selected / being run).
 *
 * Conductors are preloaded ahead of use, and a warm spare is created after every Run. Each spare's
 * web plugin boots and registers its tab immediately; but the global manager keys tabs by plugin
 * id, so a freshly-booted spare would overwrite the running conductor's populated tab — e.g. the
 * Stepper's steps flash, then revert to its empty "welcome" view as the idle spare re-registers an
 * empty tab. Buffering per conductor and gating every forward on {@link active} prevents that: an
 * inactive spare never touches {@link sideContentManager} at all, so it cannot clobber anything.
 *
 * Deliberately does *not* clear other conductors' tabs on activation or deactivation — e.g. opening
 * the Stepper tab switches the active evaluator to a separate stepper-only conductor, but the
 * regular conductor's Data Visualizer tab (registered by a plugin the stepper conductor never
 * loads) should stay put rather than vanish. Each tab is independently identified by its id, so a
 * fresh same-id registration (the warm-spare-replaces-populated-tab case above) already overwrites
 * correctly via {@link sideContentManager}'s own per-id `Map`; nothing here needs to clear first.
 * {@link unregisterAll} is the precise counterpart for when a conductor is actually torn down.
 */
export class DeferredConductorTabService implements ITabService {
  private readonly tabs = new Map<string, Tab>();
  private readonly visibleTabIds = new Set<string>();
  // Ids this conductor has actually forwarded to sideContentManager and not yet unregistered from
  // there — the source of truth for what activate()/unregisterAll() need to touch there, kept
  // separate from `tabs`/`visibleTabIds` because the two can drift apart while inactive:
  // registerTab/unregisterTab/hideTab/revealTab always update the local buffer immediately, but only
  // reach sideContentManager while `active` (see each method below). E.g. unregisterTab(id) called
  // while inactive removes `id` from `tabs` right away, but `id` stays in `forwarded` — and thus
  // still visible in sideContentManager — until the next activate() reconciles the two, or
  // unregisterAll() tears the whole conductor down. Only ever contains ids this conductor itself
  // registered, so every use below only ever touches this conductor's own entries in the shared
  // manager, never another conductor's.
  private readonly forwarded = new Set<string>();
  // The last tab this conductor explicitly focused via showTab(), if any - replayed as a single
  // showTab() call after all tabs are revealed on activate(), so activation doesn't just reproduce
  // visibility but also which tab (if any) this conductor wanted focused. Tabs only ever revealed
  // via revealTab() never touch this, matching showTab()/revealTab()'s focus-vs-visibility split.
  private lastSelectedId: string | undefined;
  private active = false;

  // The owning evaluator's path doubles as this instance's owner-token identity for
  // sideContentManager - identity (not just path) matters because a consumed conductor and its
  // just-built successor share a path but must not be able to unregister each other's tabs.
  constructor(readonly evaluatorPath: string) {}

  registerTab(tab: Tab): void {
    this.tabs.set(tab.id, tab);
    if (this.active) {
      sideContentManager.registerTab(tab, this);
      this.forwarded.add(tab.id);
    }
  }

  unregisterTab(id: string): void {
    this.tabs.delete(id);
    this.visibleTabIds.delete(id);
    if (this.lastSelectedId === id) {
      this.lastSelectedId = undefined;
    }
    if (this.active) {
      sideContentManager.unregisterTab(id, this);
      this.forwarded.delete(id);
    }
  }

  showTab(id: string): void {
    this.visibleTabIds.add(id);
    this.lastSelectedId = id;
    if (this.active) {
      sideContentManager.showTab(id);
    }
  }

  revealTab(id: string): void {
    this.visibleTabIds.add(id);
    if (this.active) {
      sideContentManager.revealTab(id);
    }
  }

  hideTab(id: string): void {
    this.visibleTabIds.delete(id);
    if (this.lastSelectedId === id) {
      this.lastSelectedId = undefined;
    }
    if (this.active) {
      sideContentManager.hideTab(id);
    }
  }

  /** Unregisters every tab this conductor has ever forwarded to the shared manager — for when the
   * conductor itself is being torn down (see `terminatePreparedConductor`), as opposed to merely
   * becoming inactive. Iterates {@link forwarded} (not `tabs` — see its doc comment) and, unlike the
   * per-id methods above, acts regardless of {@link active}: a conductor is very often inactive by
   * the time it's actually torn down (deactivated when some other conductor took over, then later
   * discarded), and forwarded entries left over from its last active period still need to go. Copies
   * `forwarded` to an array first since sideContentManager.unregisterTab has no reason to reenter
   * this class, but iterating a Set while clearing it in the same pass is easy to get wrong later. */
  unregisterAll(): void {
    for (const id of [...this.forwarded]) {
      sideContentManager.unregisterTab(id, this);
    }
    this.forwarded.clear();
    this.tabs.clear();
    this.visibleTabIds.clear();
    this.lastSelectedId = undefined;
  }

  /** Surfaces this conductor's tabs in the UI, reconciling against whatever's still forwarded from a
   * previous active period — registrations, unregistrations, reveals and hides made while inactive
   * only ever touched the local buffer (see {@link forwarded}'s doc comment), so this is where they
   * finally catch up with the shared manager. Only ever adds, removes or updates entries under ids
   * this conductor itself owns, so other conductors' tabs are untouched either way. */
  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;

    // Forwarded before, but unregistered locally while inactive: drop from the shared manager too.
    for (const id of [...this.forwarded]) {
      if (!this.tabs.has(id)) {
        sideContentManager.unregisterTab(id, this);
        this.forwarded.delete(id);
      }
    }
    // Everything currently wanted: (re-)register so the shared manager has a current copy. A
    // re-registration of an already-forwarded id preserves its existing visibility (see
    // TabService.registerTab), so this can't clobber the reveal/hide reconciliation just below.
    for (const tab of this.tabs.values()) {
      sideContentManager.registerTab(tab, this);
      this.forwarded.add(tab.id);
    }
    // Reconcile visibility: reveal/hide calls made while inactive only updated visibleTabIds locally.
    for (const id of this.forwarded) {
      if (this.visibleTabIds.has(id)) {
        sideContentManager.revealTab(id);
      } else {
        sideContentManager.hideTab(id);
      }
    }
    // Replayed once only: conductor reuse (the new session model) means a conductor can now be
    // reactivated after already being displayed once, and re-showing a tab the user has since
    // navigated away from would yank focus back unexpectedly.
    if (this.lastSelectedId !== undefined) {
      sideContentManager.showTab(this.lastSelectedId);
      this.lastSelectedId = undefined;
    }
  }

  /** Stops forwarding to the UI. This conductor's own tabs are left as they were in the shared
   * manager — see this class's doc comment for why — until it either reactivates (which reconciles
   * any changes made while inactive, see {@link activate}) or is torn down (see {@link unregisterAll}).
   */
  deactivate(): void {
    this.active = false;
  }
}
