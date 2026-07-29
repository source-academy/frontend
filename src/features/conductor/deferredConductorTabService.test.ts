import type { Tab } from '@sourceacademy/common-tabs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../commons/sideContent/SideContentManager', () => ({
  default: {
    registerTab: vi.fn(),
    unregisterTab: vi.fn(),
    showTab: vi.fn(),
    revealTab: vi.fn(),
    hideTab: vi.fn(),
  },
}));

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
    vi.clearAllMocks();
  });

  test('buffers registrations/reveals while inactive without touching the shared manager', () => {
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.revealTab('a');
    expect(sideContentManager.registerTab).not.toHaveBeenCalled();
    expect(sideContentManager.revealTab).not.toHaveBeenCalled();
  });

  test('activate() forwards buffered registration, visibility and selection', () => {
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.revealTab('a');
    service.showTab('a');

    service.activate();

    expect(sideContentManager.registerTab).toHaveBeenCalledWith(tab('a'));
    expect(sideContentManager.revealTab).toHaveBeenCalledWith('a');
    expect(sideContentManager.showTab).toHaveBeenCalledWith('a');
  });

  test('unregisters immediately while active', () => {
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.activate();
    vi.clearAllMocks();

    service.unregisterTab('a');

    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a');
  });

  // Regression: an unregisterTab() call while inactive used to update the local buffer only, leaving
  // a stale entry in sideContentManager forever - the next activate() had no way to notice it was no
  // longer wanted, since it only ever forwarded what *was* in the buffer, never reconciled what had
  // been removed from it since the last time this conductor was active.
  test('reconciles an unregister made while inactive on the next activate, instead of leaking a stale entry', () => {
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.activate();
    service.deactivate();
    vi.clearAllMocks();

    service.unregisterTab('a'); // buffered only - conductor is inactive
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();

    service.activate();
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a');
    expect(sideContentManager.registerTab).not.toHaveBeenCalled(); // 'a' is gone, nothing to re-register
  });

  // Same bug, the visibility half: hideTab() while inactive must still take effect once reactivated.
  test('reconciles a hide made while inactive on the next activate', () => {
    const service = new DeferredConductorTabService();
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
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.unregisterTab('a');
    service.activate();

    expect(sideContentManager.registerTab).not.toHaveBeenCalled();
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();
  });

  test('unregisterAll() removes every forwarded tab even while inactive (conductor teardown)', () => {
    const service = new DeferredConductorTabService();
    service.registerTab(tab('a'));
    service.registerTab(tab('b'));
    service.activate();
    service.deactivate();
    vi.clearAllMocks();

    service.unregisterAll();

    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('a');
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('b');
  });

  // Regression: unregisterAll() used to iterate `this.tabs.keys()` while unregisterTab() deleted from
  // that very map inside the loop. Safe in practice under the Map iterator spec, but fragile and easy
  // to break under a future refactor - this pins down that every entry is still reached.
  test('unregisterAll() reaches every entry despite mutating state during the pass', () => {
    const service = new DeferredConductorTabService();
    for (const id of ['a', 'b', 'c', 'd']) {
      service.registerTab(tab(id));
    }
    service.activate();
    vi.clearAllMocks();

    service.unregisterAll();

    expect(sideContentManager.unregisterTab).toHaveBeenCalledTimes(4);
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(sideContentManager.unregisterTab).toHaveBeenCalledWith(id);
    }
  });

  test("two independent conductors never forward or remove each other's tabs", () => {
    const conductorA = new DeferredConductorTabService();
    const conductorB = new DeferredConductorTabService();
    conductorA.registerTab(tab('only-a'));
    conductorA.activate();
    vi.clearAllMocks();

    conductorB.registerTab(tab('only-b'));
    conductorB.activate();
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalled();
    expect(sideContentManager.registerTab).not.toHaveBeenCalledWith(tab('only-a'));

    conductorB.unregisterAll();
    expect(sideContentManager.unregisterTab).toHaveBeenCalledWith('only-b');
    expect(sideContentManager.unregisterTab).not.toHaveBeenCalledWith('only-a');
  });
});
