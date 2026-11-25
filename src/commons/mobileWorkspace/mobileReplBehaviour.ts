import { type SideContentTabId, SideContentType } from '../sideContent/SideContentTypes';

/**
 * Tabs that show a program's evaluation themselves, so the REPL stays out of the way: the ones the
 * frontend builds, and those that a plugin says hide the REPL (`hidesRepl` in the plugin directory).
 */
function isVisualizerTab(
  tabId: SideContentTabId,
  hidesRepl: (tabId: SideContentTabId) => boolean,
): boolean {
  return (
    tabId === SideContentType.substVisualizer ||
    tabId === SideContentType.cseMachine ||
    hidesRepl(tabId)
  );
}

/**
 * How the mobile workspace's draggable REPL reacts to a side-content tab change: whether to show it
 * (only when Run is pressed, unless coming from a tab that shows the evaluation itself or the
 * test-case tabs) and whether dragging it is disabled (on the files tab and the visualizer tabs, and
 * when Run is pressed from a visualizer tab — which stays selected, see `useSideContent`).
 * `hidesRepl` says whether a plugin's tab hides the REPL.
 */
export function mobileReplBehaviour(
  newTabId: SideContentTabId,
  prevTabId: SideContentTabId,
  hidesRepl: (tabId: SideContentTabId) => boolean = () => false,
): { showRepl: boolean; disableDragging: boolean } {
  const pressedRun = newTabId === SideContentType.mobileEditorRun;
  return {
    showRepl:
      pressedRun &&
      !(
        isVisualizerTab(prevTabId, hidesRepl) ||
        prevTabId === SideContentType.autograder ||
        prevTabId === SideContentType.testcases
      ),
    disableDragging:
      newTabId === SideContentType.folder ||
      isVisualizerTab(newTabId, hidesRepl) ||
      (pressedRun && isVisualizerTab(prevTabId, hidesRepl)),
  };
}
