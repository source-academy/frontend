import { useSyncExternalStore } from 'react';

/**
 * Where a Blueprint overlay (Popover, Tooltip) should render so it stays visible: inside the
 * element that is currently fullscreen, if any. Overlays portal to `document.body` by default,
 * and in fullscreen mode (see Workspace's `.right-parent`) only the fullscreen element's subtree
 * is drawn, so an overlay opened there would be invisible. `undefined` leaves Blueprint's default.
 */
export function fullscreenPortalContainer(): HTMLElement | undefined {
  return document.fullscreenElement instanceof HTMLElement ? document.fullscreenElement : undefined;
}

const subscribe = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
};

/**
 * {@link fullscreenPortalContainer}, kept current: re-renders the component when fullscreen is
 * entered or exited, so a view whose host does not re-render it (the environment view lent to web
 * plugins) still gives its overlays the right container.
 */
export function useFullscreenPortalContainer(): HTMLElement | undefined {
  useSyncExternalStore(subscribe, () => document.fullscreenElement);
  return fullscreenPortalContainer();
}
