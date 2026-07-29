import type { Tab } from '@sourceacademy/common-tabs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Spies wrap the *real* sideContentManager singleton (call-through, not replaced) rather than a bag
// of bare vi.fn()s - assertions on individual calls work exactly as before, but the real registration/
// ownership logic also genuinely runs. That's required for the cross-conductor regression test below,
// which checks an actual invariant of TabService's owner-tracking (see SideContentManager.ts), not
// just what DeferredConductorTabService itself chose to call.
import sideContentManager from '../../commons/sideContent/SideContentManager';
import { DeferredConductorTabService } from './deferredConductorTabService';

const tab = (id: string): Tab => ({
  id,
  label: id,
  iconName: 'flow-review',
  body: null,
});

describe('DeferredConductorTabService', () => {
  beforeEach(() => {
    vi.spyOn(sideContentManager, 'registerTab');
    vi.spyOn(sideContentManager, 'unregisterTab');
    vi.spyOn(sideContentManager, 'showTab');
    vi.spyOn(sideContentManager, 'revealTab');
    vi.spyOn(sideContentManager, 'hideTab');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('buffers registrations/reveals while inactive without touching the shared manager', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.revealTab('a');
    expect(sideContentManager.registerTab).not.toHaveBeenCalled();
    expect(sideContentManager.revealTab).not.toHaveBeenCalled();
  });

  test('activate() forwards buffered registration, visibility and selection', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.revealTab('a');
    service.showTab('a');

    service.activate();

    expect(sideContentManager.registerTab).toHaveBeenCalledWith(tab('a'), service);
    expect(sideContentManager.revealTab).toHaveBeenCalledWith('a');
    expect(sideContentManager.showTab).toHaveBeenCalledWith('a');
  });

  test('unregisters immediately while active', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.activate();
    vi.clearAllMocks();

    service.unregisterTab('a');

    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a', service);
  });

  // Regression: an unregisterTab() call while inactive used to update the local buffer only, leaving
  // a stale entry in sideContentManager forever - the next activate() had no way to notice it was no
  // longer wanted, since it only ever forwarded what *was* in the buffer, never reconciled what had
  // been removed from it since the last time this conductor was active.
  test('reconciles an unregister made while inactive on the next activate, instead of leaking a stale entry', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.activate();
    service.deactivate();
    vi.clearAllMocks();

    service.unregisterTab('a'); // buffered only - conductor is inactive
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();

    service.activate();
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a', service);
    expect(sideContentManager.registerTab).not.toHaveBeenCalled(); // 'a' is gone, nothing to re-register
  });

  // Same bug, the visibility half: hideTab() while inactive must still take effect once reactivated.
  test('reconciles a hide made while inactive on the next activate', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.revealTab('a');
    service.activate();
    service.deactivate();
    vi.clearAllMocks();

    service.hideTab('a'); // buffered only
    service.activate();

    expect(sideContentManager.hideTab).toHaveBeenCalledWith('a');
  });

  test('a tab registered while inactive, then unregistered before ever activating, never touches the shared manager', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.unregisterTab('a');
    service.activate();

    expect(sideContentManager.registerTab).not.toHaveBeenCalled();
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();
  });

  test('unregisterAll() removes every forwarded tab even while inactive (conductor teardown)', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    service.registerTab(tab('a'));
    service.registerTab(tab('b'));
    service.activate();
    service.deactivate();
    vi.clearAllMocks();

    service.unregisterAll();

    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a', service);
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('b', service);
  });

  // Regression: unregisterAll() used to iterate `this.tabs.keys()` while unregisterTab() deleted from
  // that very map inside the loop. Safe in practice under the Map iterator spec, but fragile and easy
  // to break under a future refactor - this pins down that every entry is still reached.
  test('unregisterAll() reaches every entry despite mutating state during the pass', () => {
    const service = new DeferredConductorTabService('evaluator-a');
    for (const id of ['a', 'b', 'c', 'd']) {
      service.registerTab(tab(id));
    }
    service.activate();
    vi.clearAllMocks();

    service.unregisterAll();

    expect(sideContentManager.unregisterTab).toHaveBeenCalledTimes(4);
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(sideContentManager.unregisterTab).toHaveBeenCalledWith(id, service);
    }
  });

  test("two independent conductors never forward or remove each other's tabs", () => {
    const conductorA = new DeferredConductorTabService('evaluator-a');
    const conductorB = new DeferredConductorTabService('evaluator-b');
    conductorA.registerTab(tab('only-a'));
    conductorA.activate();
    vi.clearAllMocks();

    conductorB.registerTab(tab('only-b'));
    conductorB.activate();
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();
    expect(sideContentManager.registerTab).not.toHaveBeenCalledWith(tab('only-a'), conductorA);

    conductorB.unregisterAll();
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('only-b', conductorB);
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalledWith('only-a', conductorA);
  });

  // The invariant that makes multi-conductor session coexistence safe (see conductorEvaluatorCache.ts's
  // ConductorSession model): a conductor superseded by a newer instance of the *same* evaluator (e.g. a
  // warm spare taking over after a Run) must not be able to tear down the tab the newer instance now
  // owns, even though both registered it under the identical id. Exercises the real sideContentManager,
  // not just what DeferredConductorTabService itself called - the owner check lives in TabService.
  test("a superseded conductor's unregisterAll() cannot remove a tab a newer instance re-registered under the same id", () => {
    const conductorA = new DeferredConductorTabService('py2js');
    const conductorB = new DeferredConductorTabService('py2js');

    conductorA.registerTab(tab('data-visualizer'));
    conductorA.revealTab('data-visualizer');
    conductorA.activate();
    expect(sideContentManager.getTabs('playground').map(t => t.id)).toContain('data-visualizer');

    // B takes over the same tab id - the warm-spare-replaces-populated-tab case
    // DeferredConductorTabService exists to handle - becoming its current owner.
    conductorB.registerTab(tab('data-visualizer'));
    conductorB.revealTab('data-visualizer');
    conductorB.activate();

    // A is later torn down (e.g. session teardown terminating every superseded conductor). It must not
    // rip out the tab B now owns, even though A itself once registered that very id.
    conductorA.unregisterAll();

    expect(sideContentManager.getTabs('playground').map(t => t.id)).toContain('data-visualizer');
  });
});
