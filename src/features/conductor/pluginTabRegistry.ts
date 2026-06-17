/**
 * A generic registry of side-content tabs contributed by Conductor **web plugins**.
 *
 * Conductor itself has no UI mechanism, so when the host loads a web plugin that exposes a `tab`
 * (see {@link ConductorPluginTab}), we record it here. The Playground renders these tabs via
 * `useSyncExternalStore`. This module is deliberately plugin-agnostic — it knows nothing about the
 * stepper or any specific plugin, so adding another web plugin needs no changes here.
 */

export type ConductorPluginTab = {
  /** Stable id for the tab. */
  id: string;
  /** Tab label shown to the user. */
  label: string;
  /** Blueprint icon name for the tab. */
  iconName: string;
  /** The React component rendered as the tab body. Self-contained; takes no props. */
/**
 * A generic registry of side-content tabs contributed by Conductor **web plugins**.
 *
 * Conductor itself has no UI mechanism, so when the host loads a web plugin that exposes a `tab`
 * (see {`@link` ConductorPluginTab}), we record it here. The Playground renders these tabs via
 * `useSyncExternalStore`. This module is deliberately plugin-agnostic — it knows nothing about the
 * stepper or any specific plugin, so adding another web plugin needs no changes here.
 */
import type React from 'react';

export type ConductorPluginTab = {
  Component: React.ComponentType;
};

/** Structural shape of a web plugin that contributes a tab. */
export type TabContributingPlugin = {
  tab?: ConductorPluginTab;
};

let pluginTabs: ConductorPluginTab[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach(listener => listener());
}

/** Registers a plugin tab (ignored if one with the same id already exists). */
export function registerPluginTab(tab: ConductorPluginTab): void {
  if (pluginTabs.some(existing => existing.id === tab.id)) return;
  pluginTabs = [...pluginTabs, tab];
  emit();
}

/**
 * Records the tab of a freshly-loaded plugin, if it contributes one. Returns true if a tab was
 * registered.
 */
export function registerPluginTabIfPresent(plugin: unknown): boolean {
  const tab = (plugin as TabContributingPlugin | null)?.tab;
  if (
    tab &&
    typeof tab.id === 'string' &&
    typeof tab.label === 'string' &&
    typeof tab.Component === 'function'
  ) {
    registerPluginTab(tab);
    return true;
  }
  return false;
}

/** Removes all registered plugin tabs (e.g. when the conductor is torn down). */
export function clearPluginTabs(): void {
  if (pluginTabs.length === 0) return;
  pluginTabs = [];
  emit();
}

/** The current snapshot of registered plugin tabs (stable reference between changes). */
export function getPluginTabs(): ConductorPluginTab[] {
  return pluginTabs;
}

/** Subscribe to changes in the registered plugin tabs. Returns an unsubscribe function. */
export function subscribePluginTabs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
