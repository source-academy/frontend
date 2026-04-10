import { Context } from 'js-slang';
import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { parse } from 'js-slang/dist/parser/parser';
import React from 'react';

import { arrowSelection } from './components/arrows/ArrowSelection';
import { CseAnimation } from './CseMachineAnimation';
import { Layout, LayoutCache } from './CseMachineLayout';
import { ArrowOriginFilterKey, ArrowOriginFilters, EnvTree, EnvTreeNode } from './CseMachineTypes';
import { deepCopyTree, getEnvId } from './CseMachineUtils';

type SetVis = (vis: React.ReactNode) => void;
type SetEditorHighlightedLines = (segments: [number, number][]) => void;
type SetisStepLimitExceeded = (isControlEmpty: boolean) => void;

/** CSE Machine is exposed from this class */
export default class CseMachine {
  private static readonly arrowOriginFilterKeys: ArrowOriginFilterKey[] = [
    'text',
    'frame',
    'function',
    'array',
    'control',
    'stash'
  ];
  private static readonly defaultArrowOriginFilters: ArrowOriginFilters = {
    text: true,
    frame: true,
    function: true,
    array: true,
    control: true,
    stash: true
  };
  /** callback function to update the visualization state in the SideContentCseMachine component */
  private static setVis: SetVis;
  /** function to highlight editor lines */
  public static setEditorHighlightedLines: SetEditorHighlightedLines;
  /** callback function to update the step limit exceeded state in the SideContentCseMachine component */
  private static setIsStepLimitExceeded: SetisStepLimitExceeded;
  // Ghost layout snapshots, separated by mode to keep coordinates fixed within each mode.
  public static normalLayoutCache: LayoutCache | null = null;
  public static normalLiveLayoutCache: LayoutCache | null = null;
  public static printLayoutCache: LayoutCache | null = null;
  public static printLiveLayoutCache: LayoutCache | null = null;
  public static usedBuiltInNames = new Set<string>();
  private static printableMode: boolean = false;
  private static controlStash: boolean = false; // TODO: discuss if the default should be true
  private static stackTruncated: boolean = false;
  private static pairCreationMode: boolean = false;
  private static centerAlignment: boolean = false;
  private static centerAlignmentToggled: boolean = false;
  private static arrowOriginFilters: ArrowOriginFilters = {
    ...CseMachine.defaultArrowOriginFilters
  };
  private static environmentTree: EnvTree | undefined;
  private static currentEnvId: string;
  private static control: Control | undefined;
  private static stash: Stash | undefined;
  private static streamLineage: Map<string, string[]>;
  public static togglePrintableMode(): void {
    CseMachine.printableMode = !CseMachine.printableMode;
  }
  public static toggleControlStash(): void {
    //CseMachine.pairCreationMode = false;
    CseMachine.controlStash = !CseMachine.controlStash;
  }
  public static toggleStackTruncated(): void {
    CseMachine.stackTruncated = !CseMachine.stackTruncated;
  }
  public static togglePairCreationMode(): void {
    CseMachine.pairCreationMode = !CseMachine.pairCreationMode;
  }
  public static resetPairCreationMode(): void {
    CseMachine.pairCreationMode = false;
  }
  public static setClearDeadFrames(enabled: boolean): void {
    Layout.clearDeadFrames = enabled;
  }
  public static clearCachedLayouts(): void {
    CseMachine.normalLayoutCache = null;
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
    CseMachine.usedBuiltInNames.clear();
    CseMachine.clearMemoizedLayouts();
  }

  /**
   * Clears memoized rendered nodes while preserving fixed-position caches and
   * used built-in names inferred from source code.
   *
   * Use this for view-only toggles (for example arrow filters) that should
   * force a fresh draw without recomputing global-frame built-in function names.
   */
  public static clearRenderedLayouts(): void {
    CseMachine.clearMemoizedLayouts();
  }

  private static clearMemoizedLayouts(): void {
    Layout.currentLight = undefined;
    Layout.currentDark = undefined;
    Layout.currentStackDark = undefined;
    Layout.currentStackTruncDark = undefined;
    Layout.currentStackLight = undefined;
    Layout.currentStackTruncLight = undefined;
    Layout.prevLayout = undefined;
    Layout.key = 0;
  }
  public static clearLiveLayouts(): void {
    CseMachine.normalLiveLayoutCache = null;
    CseMachine.printLiveLayoutCache = null;
  }
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
  public static getCenterAlignment(): boolean {
    return CseMachine.centerAlignment;
  }

  public static getArrowOriginFilters(): ArrowOriginFilters {
    return { ...CseMachine.arrowOriginFilters };
  }

  public static isArrowOriginVisible(origin: ArrowOriginFilterKey | null): boolean {
    if (origin === null) return true;
    return CseMachine.arrowOriginFilters[origin];
  }

  public static setArrowOriginVisible(origin: ArrowOriginFilterKey, visible: boolean): void {
    CseMachine.arrowOriginFilters[origin] = visible;
  }

  public static setAllArrowOriginsVisible(visible: boolean): void {
    for (const origin of CseMachine.arrowOriginFilterKeys) {
      CseMachine.arrowOriginFilters[origin] = visible;
    }
  }

  public static resetArrowOriginFilters(): void {
    CseMachine.arrowOriginFilters = { ...CseMachine.defaultArrowOriginFilters };
  }
  public static getMasterLayout(): LayoutCache | null {
    return CseMachine.getPrintableMode()
      ? Layout.clearDeadFrames
        ? CseMachine.printLiveLayoutCache
        : CseMachine.printLayoutCache
      : Layout.clearDeadFrames
        ? CseMachine.normalLiveLayoutCache
        : CseMachine.normalLayoutCache;
  }
  public static setMasterLayout(cache: LayoutCache): void {
    if (CseMachine.getPrintableMode()) {
      if (Layout.clearDeadFrames) {
        CseMachine.printLiveLayoutCache = cache;
      } else {
        CseMachine.printLayoutCache = cache;
      }
    } else {
      if (Layout.clearDeadFrames) {
        CseMachine.normalLiveLayoutCache = cache;
      } else {
        CseMachine.normalLayoutCache = cache;
      }
    }
  }
  public static getStreamLineage(key: string): string[] | undefined {
    return CseMachine.streamLineage.get(key);
  }
  public static findKeyByValueInMap(value: any) {
    for (const [key, array] of CseMachine.streamLineage.entries()) {
      // console.log(key + array);
      if (array.includes(value)) {
        return key;
      }
    }

    return undefined;
  }
  public static getPairCreationMode(): boolean {
    return CseMachine.pairCreationMode;
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
    CseMachine.streamLineage = context.streamLineage;
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
        const rootNode = context?.runtime?.environmentTree?.root as EnvTreeNode | undefined;

        if (rootNode) {
          const globalEnvHead = rootNode?.environment?.head || {};
          const preludeEnvHead = rootNode?.children?.[0]?.environment?.head || {};

          // Helper to check if a word is actually a built-in function
          const isBuiltIn = (name: string) => name in globalEnvHead || name in preludeEnvHead;

          const ast = parse(userCode, context);

          if (ast) {
            // THE scope stack: Index 0 is the global program scope.
            // We push a new Set() when entering a block/function, and pop() when leaving.
            const scopeStack: Set<string>[] = [new Set()];

            const currentScope = () => scopeStack[scopeStack.length - 1];

            // Checks if a variable exists in the current scope or any parent scope
            const isDeclaredInScope = (name: string) => {
              for (let i = scopeStack.length - 1; i >= 0; i--) {
                if (scopeStack[i].has(name)) return true;
              }
              return false;
            };

            const declareName = (node: any) => {
              if (node && node.type === 'Identifier') {
                currentScope().add(node.name);
              }
            };

            // The Recursive Walker
            const walk = (node: any, parentType?: string, keyName?: string) => {
              if (!node || typeof node !== 'object') return;

              let isNewScope = false;

              // Enter Scope Boundary (Blocks and Functions)
              if (node.type === 'BlockStatement' || node.type === 'Program') {
                isNewScope = true;
                if (node.type !== 'Program') scopeStack.push(new Set());

                // add declarations into this scope before traversing deeper
                const body = node.body || [];
                for (const stmt of body) {
                  if (stmt.type === 'VariableDeclaration') {
                    for (const decl of stmt.declarations) {
                      declareName(decl.id);
                    }
                  } else if (stmt.type === 'FunctionDeclaration') {
                    declareName(stmt.id);
                  }
                }
              } else if (
                node.type === 'ArrowFunctionExpression' ||
                node.type === 'FunctionExpression' ||
                node.type === 'FunctionDeclaration'
              ) {
                isNewScope = true;
                scopeStack.push(new Set());
                // Function parameters act as local variables in this new scope
                if (node.params) {
                  node.params.forEach(declareName);
                }
              }

              // Check Identifier Usage
              if (node.type === 'Identifier') {
                // Ignore property access
                const isProperty = parentType === 'MemberExpression' && keyName === 'property';

                // If it's used, not in our scope stack, and is a built-in, add it to used global functions
                if (!isProperty && !isDeclaredInScope(node.name) && isBuiltIn(node.name)) {
                  CseMachine.usedBuiltInNames.add(node.name);
                }
              }

              // Traverse Children Recursively
              for (const key in node) {
                const child = node[key];
                if (child && typeof child === 'object') {
                  if (Array.isArray(child)) {
                    child.forEach(c => walk(c, node.type, key));
                  } else {
                    walk(child, node.type, key);
                  }
                }
              }

              // Exit Scope Boundary
              if (isNewScope && node.type !== 'Program') {
                scopeStack.pop();
              }
            };
            walk(ast);

            const worklist = Array.from(CseMachine.usedBuiltInNames);

            for (let i = 0; i < worklist.length; i++) {
              const name = worklist[i];

              // If it's a predeclared function, it might rely on other predeclared/built-in
              if (name in preludeEnvHead) {
                const source = preludeEnvHead[name]?.toString() || '';
                const internalWords = source.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];

                for (const dep of internalWords) {
                  if (isBuiltIn(dep) && !CseMachine.usedBuiltInNames.has(dep)) {
                    CseMachine.usedBuiltInNames.add(dep);
                    worklist.push(dep);
                  }
                }
              }
            }
          }
        }
      }

      const originalMode = CseMachine.getPrintableMode();
      const originalAlignment = CseMachine.getCenterAlignment();

      const buildCache = (printable: boolean) => {
        CseMachine.printableMode = printable;
        CseMachine.centerAlignment = false;
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
      CseMachine.centerAlignment = originalAlignment;
      CseMachine.setClearDeadFrames(false);
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
      CseAnimation.updateAnimation();
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
        Layout.applyFixedPositions();
        CseAnimation.updateAnimation();
        this.setVis(Layout.draw());
        this.centerAlignmentToggled = false;
      }
      // redraw environment model and populate live layout caches
      if (Layout.clearDeadFrames) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
        CseAnimation.updateAnimation();
      }

      if (CseMachine.getPairCreationMode()) {
        Layout.setContext(CseMachine.environmentTree, CseMachine.control, CseMachine.stash);
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
        CseAnimation.updateAnimation();
        this.setVis(Layout.draw());
        // this.setVis(Layout.draw());
        // console.log(Layout.currentDarkPairs);
        // this.setVis(Layout.currentDarkPairs);
      } else if (
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
        if (!CseMachine.getMasterLayout()) {
          CseMachine.setMasterLayout(Layout.getLayoutPositions(this.controlStash));
        }
        Layout.applyFixedPositions();
        CseAnimation.updateAnimation();
        this.setVis(Layout.draw());
      }
      this.setVis(Layout.draw());
      Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
    }
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }

  static clearCse() {
    CseMachine.resetArrowOriginFilters();
    CseMachine.resetPairCreationMode();
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
