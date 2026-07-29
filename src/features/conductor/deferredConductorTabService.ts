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
  // The last tab this conductor explicitly focused via showTab(), if any - replayed as a single
  // showTab() call after all tabs are revealed on activate(), so activation doesn't just reproduce
  // visibility but also which tab (if any) this conductor wanted focused. Tabs only ever revealed
  // via revealTab() never touch this, matching showTab()/revealTab()'s focus-vs-visibility split.
  private lastSelectedId: string | undefined;
  private active = false;

  registerTab(tab: Tab): void {
    this.tabs.set(tab.id, tab);
    if (this.active) {
      sideContentManager.registerTab(tab);
    }
  }

  unregisterTab(id: string): void {
    this.tabs.delete(id);
    this.visibleTabIds.delete(id);
    if (this.lastSelectedId === id) {
      this.lastSelectedId = undefined;
    }
    if (this.active) {
      sideContentManager.unregisterTab(id);
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

  /** Unregisters every tab this conductor has ever registered — for when the conductor itself is
   * being torn down (see `terminatePreparedConductor`), as opposed to merely becoming inactive.
   * Only affects {@link sideContentManager} for the ids this conductor actually owns; other
   * conductors' tabs are untouched, same as everywhere else in this class. */
  unregisterAll(): void {
    for (const id of this.tabs.keys()) {
      this.unregisterTab(id);
    }
  }

  /** Surfaces this conductor's already-buffered tabs in the UI (any registered later while active
   * forward immediately, same as normal). Does not touch other conductors' tabs — see this class's
   * doc comment. */
  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    for (const tab of this.tabs.values()) {
      sideContentManager.registerTab(tab);
    }
    for (const id of this.visibleTabIds) {
      sideContentManager.revealTab(id);
    }
    if (this.lastSelectedId !== undefined) {
      sideContentManager.showTab(this.lastSelectedId);
    }
  }

  /** Stops forwarding to the UI. This conductor's own tabs are left as they were in the shared
   * manager — see this class's doc comment for why — until it either reactivates or is torn down
   * (see {@link unregisterAll}). */
  deactivate(): void {
    this.active = false;
  }
}
