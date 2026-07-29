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
 * empty tab. Buffering per conductor and surfacing only the active one keeps the visible tab tied
 * to the conductor the user actually ran.
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

  /** Surfaces this conductor's tabs in the UI, replacing whatever the previous active one showed. */
  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    sideContentManager.clearTabs();
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

  /** Stops forwarding to the UI. The next conductor to activate clears and replays the manager. */
  deactivate(): void {
    this.active = false;
  }
}
