import type { ITabService, Tab } from '@sourceacademy/common-tabs';

import type { SideContentLocation, SideContentTab } from './SideContentTypes';

type Listener = () => void;

type RegisteredTab = {
  tab: SideContentTab;
  visible: boolean;
};

export class TabService implements ITabService {
  private readonly emptyTabs: SideContentTab[] = [];
  private readonly listeners = new Set<Listener>();
  private readonly tabs = new Map<string, RegisteredTab>();
  private visibleTabs: SideContentTab[] = [];
  private workspaceLocation: SideContentLocation = 'playground';

  registerTab(tab: Tab): void {
    const currentTab = this.tabs.get(tab.id);
    this.tabs.set(tab.id, {
      tab,
      visible: currentTab?.visible ?? false,
    });
    this.emit();
  }

  unregisterTab(id: string): void {
    if (!this.tabs.delete(id)) {
      return;
    }
    this.emit();
  }

  showTab(id: string): void {
    this.setTabVisibility(id, true);
  }

  hideTab(id: string): void {
    this.setTabVisibility(id, false);
  }

  clearTabs(): void {
    if (this.tabs.size === 0) {
      return;
    }
    this.tabs.clear();
    this.emit();
  }

  getTabs(workspaceLocation: SideContentLocation): SideContentTab[] {
    if (workspaceLocation !== this.workspaceLocation) {
      return this.emptyTabs;
    }
    return this.visibleTabs;
  }

  setWorkspaceLocation(workspaceLocation: SideContentLocation): void {
    if (this.workspaceLocation === workspaceLocation) {
      return;
    }
    this.workspaceLocation = workspaceLocation;
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.visibleTabs = Array.from(this.tabs.values())
      .filter(({ visible }) => visible)
      .map(({ tab }) => tab);
    this.listeners.forEach(listener => listener());
  }

  private setTabVisibility(id: string, visible: boolean): void {
    const currentTab = this.tabs.get(id);
    if (!currentTab || currentTab.visible === visible) {
      return;
    }
    this.tabs.set(id, {
      ...currentTab,
      visible,
    });
    this.emit();
  }
}

const sideContentManager = new TabService();

export default sideContentManager;
