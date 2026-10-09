import { isConductorStepperTab } from 'src/features/conductor/stepperTab';

import { type SideContentTabId, SideContentType } from '../sideContent/SideContentTypes';

/** Tabs that show a program's evaluation themselves, so the REPL stays out of the way. */
function isVisualizerTab(tabId: SideContentTabId): boolean {
  return (
    tabId === SideContentType.substVisualizer ||
    tabId === SideContentType.cseMachine ||
    isConductorStepperTab(tabId)
  );
}

/**
 * How the mobile workspace's draggable REPL reacts to a side-content tab change: whether to show it
 * (only when Run is pressed, unless coming from a tab that shows the evaluation itself or the
 * test-case tabs) and whether dragging it is disabled (on the files tab and the visualizer tabs, and
 * when Run is pressed from a visualizer tab — which stays selected, see `useSideContent`).
 */
export function mobileReplBehaviour(
  newTabId: SideContentTabId,
  prevTabId: SideContentTabId,
): { showRepl: boolean; disableDragging: boolean } {
  const pressedRun = newTabId === SideContentType.mobileEditorRun;
  return {
    showRepl:
      pressedRun &&
      !(
        isVisualizerTab(prevTabId) ||
        prevTabId === SideContentType.autograder ||
        prevTabId === SideContentType.testcases
      ),
    disableDragging:
      newTabId === SideContentType.folder ||
      isVisualizerTab(newTabId) ||
      (pressedRun && isVisualizerTab(prevTabId)),
  };
}
