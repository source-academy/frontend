import { Context } from 'js-slang';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import React from 'react';

import { arrowSelection } from './components/arrows/ArrowSelection';
import { Layout, LayoutCache } from './CseMachineLayout';
import { EnvTree, EnvTreeNode } from './CseMachineTypes';
import { deepCopyTree, getEnvId } from './CseMachineUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;
type SetisStepLimitExceeded = (isControlEmpty: boolean) => void;

/** CSE Machine is exposed from this class */
export default class CseMachine {
  /** callback function to update the visualization state in the SideContentCseMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  /** callback function to update the step limit exceeded state in the SideContentCseMachine component */
  private static setIsStepLimitExceeded: SetisStepLimitExceeded;
  // Ghost layout snapshots, separated by mode to keep coordinates fixed within each mode.
  public static normalLayoutCache: LayoutCache | null = null;
  public static printLayoutCache: LayoutCache | null = null;
  public static usedBuiltInNames = new Set<string>();
  private static printableMode: boolean = false;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
  private static centerAlignment: boolean = false; // added for center alignment
  private static centerAlignmentToggled: boolean = false;
  private static environmentTree: EnvTree | undefined;
  private static currentEnvId: string;
  private static control: Control | undefined;
  private static stash: Stash | undefined;
  public static togglePrintableMode(): void {
    CseMachine.printableMode = !CseMachine.printableMode;
  }
  public static toggleControlStash(): void {
    CseMachine.controlStash = !CseMachine.controlStash;
  }
  public static toggleStackTruncated(): void {
    CseMachine.stackTruncated = !CseMachine.stackTruncated;
  }
  public static setClearDeadFrames(enabled: boolean): void {
    Layout.clearDeadFrames = enabled;
  }
  public static clearCachedLayouts(): void {
    Layout.currentLight = undefined;
    Layout.currentDark = undefined;
    Layout.currentStackDark = undefined;
    Layout.currentStackTruncDark = undefined;
    Layout.currentStackLight = undefined;
    Layout.currentStackTruncLight = undefined;
    Layout.prevLayout = undefined;
    Layout.key = 0;
    CseMachine.normalLayoutCache = null;
    CseMachine.printLayoutCache = null;
    CseMachine.usedBuiltInNames.clear();
  }
  // added for center alignment
  public static toggleCenterAlignment(): void {
    CseMachine.centerAlignment = !CseMachine.centerAlignment;
    CseMachine.centerAlignmentToggled = true;
  }

  public static getCurrentEnvId(): string {
    return CseMachine.currentEnvId;
  }
  public static getPrintableMode(): boolean {
    return CseMachine.printableMode;
  }
  public static getControlStash(): boolean {
    return CseMachine.controlStash;
  }
  public static getStackTruncated(): boolean {
    return CseMachine.stackTruncated;
  }
  // added for center alignment
  public static getCenterAlignment(): boolean {
    return CseMachine.centerAlignment;
  }
  public static getMasterLayout(): LayoutCache | null {
    return CseMachine.getPrintableMode()
      ? CseMachine.printLayoutCache
      : CseMachine.normalLayoutCache;
  }
  public static setMasterLayout(cache: LayoutCache): void {
    if (CseMachine.getPrintableMode()) {
      CseMachine.printLayoutCache = cache;
    } else {
      CseMachine.normalLayoutCache = cache;
    }
  }

  public static isControl(): boolean {
    return this.control ? !this.control.isEmpty() : false;
  }

  /** SideContentCseMachine initializes this onMount with the callback function */
  static init(
    setVis: SetVis,
    width: number,
    height: number,
    setEditorHighlightedLines: (segments: [number, number][]) => void,
    setIsStepLimitExceeded: SetisStepLimitExceeded
  ) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
    this.setEditorHighlightedLines = setEditorHighlightedLines;
    this.setIsStepLimitExceeded = setIsStepLimitExceeded;
  }

  static clear() {
    Layout.values.clear();
    arrowSelection.clearSelection();
  }

  /** updates the visualization state in the SideContentCseMachine component based on
   * the JS Slang context passed in */
  static drawCse(context: Context) {
    // store environmentTree at last breakpoint.
    CseMachine.environmentTree = deepCopyTree(context.runtime.environmentTree as EnvTree);
    CseMachine.currentEnvId = getEnvId(context.runtime.environments[0]);
    if (!this.setVis || !context.runtime.control || !context.runtime.stash)
      throw new Error('CSE machine not initialized');
    CseMachine.control = context.runtime.control;
    CseMachine.stash = context.runtime.stash;
    CseMachine.setClearDeadFrames(false);

    Layout.setContext(
      context.runtime.environmentTree as EnvTree,
      context.runtime.control,
      context.runtime.stash,
      context.chapter
    );

    // Build ghost layout cache and built-in/predeclared functions cache lazily per mode, using mode-specific layout.
    if (!CseMachine.normalLayoutCache || !CseMachine.printLayoutCache) {
      const userCode = context?.unTypecheckedCode?.[0];
    
      if (typeof userCode === 'string') {
        const cleanCode = userCode
          .replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, '') 
          .replace(/\/\*[\s\S]*?\*\//g, '')           
          .replace(/\/\/.*/g, '');                      
      
        const words = cleanCode.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
      
        const rootNode = context?.runtime?.environmentTree?.root as EnvTreeNode | undefined;

        if (rootNode) {
          const globalEnvHead = rootNode?.environment?.head || {};
          const preludeEnvHead = rootNode?.children?.[0]?.environment?.head || {};

          for (const word of words) {
            if (word in globalEnvHead || word in preludeEnvHead) {
              CseMachine.usedBuiltInNames.add(word); 
            }
          }
          // Adding transitive dependencies for referenced Prelude functions
          for (const name of CseMachine.usedBuiltInNames) {
            if (name in preludeEnvHead) {
              const source = preludeEnvHead[name]?.toString() || '';
              const internalWords = source.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
            
              for (const dep of internalWords) {
                if ((dep in globalEnvHead || dep in preludeEnvHead) && !CseMachine.usedBuiltInNames.has(dep)) {
                  CseMachine.usedBuiltInNames.add(dep);
                }
              } 
            }
          }
        }
      }

      const originalMode = CseMachine.getPrintableMode();

      const buildCache = (printable: boolean) => {
        CseMachine.printableMode = printable;
        Layout.setContext(
          context.runtime.environmentTree as EnvTree,
          context.runtime.control!,
          context.runtime.stash!,
          context.chapter
        );
        return Layout.getLayoutPositions(this.controlStash);
      };

      CseMachine.printLayoutCache = buildCache(true);
      CseMachine.normalLayoutCache = buildCache(false);

      // Restore the user's actual mode setting and layout.
      CseMachine.printableMode = originalMode;
      Layout.setContext(
        context.runtime.environmentTree as EnvTree,
        context.runtime.control,
        context.runtime.stash,
        context.chapter
      );
    }

    // Apply Fixed Positions
    if (CseMachine.getMasterLayout()) {
      Layout.applyFixedPositions();
    }
    this.setVis(Layout.draw());
    this.setIsStepLimitExceeded(context.runtime.control.isEmpty());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
  }

  static redraw() {
    if (CseMachine.environmentTree && CseMachine.control && CseMachine.stash) {
      // checks if the required diagram exists, and updates the dom node using setVis

      // if center alignment is toggled, change the alignment and redraw the diagram with new coordinates
      if (this.centerAlignmentToggled) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        if (CseMachine.getMasterLayout()) {
          Layout.applyFixedPositions();
        }
        this.setVis(Layout.draw());
        this.centerAlignmentToggled = false;
      }

      if (
        CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        CseMachine.getStackTruncated() &&
        Layout.currentStackTruncLight !== undefined
      ) {
        this.setVis(Layout.currentStackTruncLight);
      } else if (
        CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        !CseMachine.getStackTruncated() &&
        Layout.currentStackLight !== undefined
      ) {
        this.setVis(Layout.currentStackLight);
      } else if (
        !CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        CseMachine.getStackTruncated() &&
        Layout.currentStackTruncDark !== undefined
      ) {
        this.setVis(Layout.currentStackTruncDark);
      } else if (
        !CseMachine.getPrintableMode() &&
        CseMachine.getControlStash() &&
        !CseMachine.getStackTruncated() &&
        Layout.currentStackDark !== undefined
      ) {
        this.setVis(Layout.currentStackDark);
      } else if (
        CseMachine.getPrintableMode() &&
        !CseMachine.getControlStash() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !CseMachine.getPrintableMode() &&
        !CseMachine.getControlStash() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (CseMachine.getMasterLayout()) {
          Layout.applyFixedPositions();
        }
        this.setVis(Layout.draw());
      }
      Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
    }
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }

  static clearCse() {
    if (this.setVis) {
      this.setVis(undefined);
      CseMachine.environmentTree = undefined;
      CseMachine.control = undefined;
      CseMachine.stash = undefined;
    }
    CseMachine.setClearDeadFrames(false);
    this.clear();
  }
}
