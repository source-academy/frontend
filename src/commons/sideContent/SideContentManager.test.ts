import type { Tab } from '@sourceacademy/common-tabs';
import { describe, expect, test } from 'vitest';

import { type TabOwner, TabService } from './SideContentManager';

const tab = (id: string): Tab => ({
  id,
  label: id,
  iconName: 'flow-review',
  body: null,
});

// A fresh TabService per test, not the shared sideContentManager singleton - these tests exercise the
// owner-tracking mechanism in isolation, independent of anything else in the app that might touch the
// real singleton.
describe('TabService tab ownership', () => {
  test('registering with an owner records it, retrievable via getTabOwnerPath', () => {
    const service = new TabService();
    const owner: TabOwner = { evaluatorPath: '/py2js.mjs' };

    service.registerTab(tab('data-visualizer'), owner);

    expect(service.getTabOwnerPath('data-visualizer')).toBe('/py2js.mjs');
  });

  test('registering without an owner leaves it untracked', () => {
    const service = new TabService();

    service.registerTab(tab('introduction'));

    expect(service.getTabOwnerPath('introduction')).toBeUndefined();
  });

  test('a second owner re-registering the same id becomes the new owner', () => {
    const service = new TabService();
    const ownerA: TabOwner = { evaluatorPath: '/py2js.mjs' };
    const ownerB: TabOwner = { evaluatorPath: '/py2js.mjs' }; // a distinct instance, same path

    service.registerTab(tab('data-visualizer'), ownerA);
    service.registerTab(tab('data-visualizer'), ownerB);

    expect(service.getTabOwnerPath('data-visualizer')).toBe('/py2js.mjs');
    // Identity, not just path equality, decides ownership from here - confirmed by the unregisterTab
    // tests below, where ownerA can no longer remove a tab ownerB has since taken over.
  });

  test('unregisterTab with a non-owner is a no-op', () => {
    const service = new TabService();
    const owner: TabOwner = { evaluatorPath: '/py2js.mjs' };
    const notOwner: TabOwner = { evaluatorPath: '/pvml.mjs' };
    service.registerTab(tab('data-visualizer'), owner);

    service.unregisterTab('data-visualizer', notOwner);

    expect(service.getTabOwnerPath('data-visualizer')).toBe('/py2js.mjs');
    expect(service.getTabs('playground')).toEqual([]); // unaffected either way - never revealed
  });

  test('unregisterTab with the current owner removes the tab and its ownership record', () => {
    const service = new TabService();
    const owner: TabOwner = { evaluatorPath: '/py2js.mjs' };
    service.registerTab(tab('data-visualizer'), owner);
    service.revealTab('data-visualizer');

    service.unregisterTab('data-visualizer', owner);

    expect(service.getTabOwnerPath('data-visualizer')).toBeUndefined();
    expect(service.getTabs('playground')).toEqual([]);
  });

  test('unregisterTab with no owner argument removes unconditionally, regardless of a tracked owner', () => {
    // Back-compat with the plain ITabService contract (e.g. a plugin unregistering its own tab
    // directly, with no owner concept of its own) - omitting the argument must still work.
    const service = new TabService();
    const owner: TabOwner = { evaluatorPath: '/py2js.mjs' };
    service.registerTab(tab('data-visualizer'), owner);
    service.revealTab('data-visualizer');

    service.unregisterTab('data-visualizer');

    expect(service.getTabOwnerPath('data-visualizer')).toBeUndefined();
    expect(service.getTabs('playground')).toEqual([]);
  });

  test("a superseded owner's stale unregisterTab call cannot remove the current owner's tab", () => {
    const service = new TabService();
    const ownerA: TabOwner = { evaluatorPath: '/py2js.mjs' };
    const ownerB: TabOwner = { evaluatorPath: '/py2js.mjs' };
    service.registerTab(tab('data-visualizer'), ownerA);
    service.revealTab('data-visualizer');
    service.registerTab(tab('data-visualizer'), ownerB); // B takes over the same id
    service.revealTab('data-visualizer');

    service.unregisterTab('data-visualizer', ownerA); // stale - A is no longer the owner

    expect(service.getTabOwnerPath('data-visualizer')).toBe('/py2js.mjs');
    expect(service.getTabs('playground').map(t => t.id)).toContain('data-visualizer');
  });
});
