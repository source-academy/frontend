/**
 * CseSnapshotAdapter — translates language-agnostic CseSnapshot (from the Conductor __cse
 * channel) into the fake js-slang-compatible objects that Layout.setContext() consumes.
 *
 * Key insight: js-slang's type guards use duck-typing (typeof, instanceof checks, field
 * presence). By constructing objects that pass those guards, we can reuse the entire Source
 * CSE Machine visualization for any language that sends CseSnapshot.
 *
 * Closures: isClosure() accepts any function with the six 'closureFields'. We create a real
 * JS function and attach those fields — no prototype surgery needed.
 * Primitives: actual JS number/string/boolean — pass typeof checks naturally.
 * Arrays: real JS arrays with .id and .environment own properties — pass isDataArray() check.
 */
import { EnvTree } from 'js-slang/dist/createContext';
import Heap from 'js-slang/dist/cse-machine/heap';
import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { InstrType } from 'js-slang/dist/cse-machine/types';
import type { Environment } from 'js-slang/dist/types';

import type {
  CseSerializedEnvFrame,
  CseSerializedValue,
  CseSnapshot,
} from '../conductor/CseMachineHostPlugin';
import { Config } from './CseMachineConfig';

// Global counter so every fake closure gets a unique id regardless of which env it was defined in.
// Layout.values memoizes FnValues by closure.id, so two closures with the same id would share
// one circle — using a counter prevents that collision.
let _closureSeq = 0;

// Minimal stub AST node — getParamsText/getBodyText read .functionName and data.toString()
// from the fake function, not from this node, so a stub is sufficient.
const STUB_BODY = { type: 'BlockStatement', body: [] };

function makeStubNode(paramNames: string[]) {
  return {
    type: 'ArrowFunctionExpression',
    params: paramNames.map(p => ({ type: 'Identifier', name: p })),
    body: STUB_BODY,
    loc: undefined,
  };
}

function toJsValue(
  v: CseSerializedValue,
  envMap: Map<string, Environment>,
  closureCache: Map<string, unknown>,
  listCache: Map<string | number, unknown>,
): unknown {
  const label = v.label.toLowerCase();

  if (label === 'int' || label === 'number') {
    const n = parseFloat(v.displayValue);
    return isNaN(n) ? 0 : n;
  }
  if (label === 'float' || label === 'complex') {
    // Return a source object so PrimitiveValue uses toReplString() instead of String(value).
    // For float: preserves the ".0" suffix (String(3) drops it).
    // For complex: avoids wrapping the value in quotes (it's not a string).
    return { toReplString: () => v.displayValue };
  }
  if (label === 'bool' || label === 'boolean') {
    return v.displayValue === 'True' || v.displayValue === 'true';
  }
  if (label === 'str' || label === 'string') {
    return v.displayValue.replace(/^["']|["']$/g, '');
  }
  if (label === 'nonetype' || label === 'none' || label === 'null') {
    return null;
  }
  if (label === 'undefined') {
    return undefined;
  }
  if (label === 'unassigned') {
    // Reconstruct the js-slang uninitialized-const sentinel so Frame.tsx
    // detects it via isUnassigned() and renders the binding as empty (no value shown).
    return Symbol('const declaration');
  }

  if (label === 'array') {
    const meta = v.metadata as any;
    const arrayId: string | undefined = meta?.id;
    const envId: string | null = meta?.envId ?? null;
    const elements: CseSerializedValue[] = meta?.elements ?? [];

    if (arrayId && listCache.has(arrayId)) return listCache.get(arrayId);

    // Build a real JS array with own `id` and `environment` so isDataArray() passes.
    const arr: any = elements.map((el: CseSerializedValue) =>
      toJsValue(el, envMap, closureCache, listCache),
    );
    Object.defineProperties(arr, {
      id: { value: arrayId ?? `arr_${Math.random()}`, writable: true },
      environment: { value: envId ? (envMap.get(envId) ?? null) : null, writable: true },
    });

    if (arrayId) listCache.set(arrayId, arr);

    // Register with the defining env's heap so the CSE visualizer draws the array box.
    if ((arr as any).environment) {
      (arr as any).environment.heap.add(arr);
    }

    return arr;
  }

  if (label === 'list') {
    const meta = v.metadata as any;
    const listId: number = meta?.id ?? 0;
    const envId: string = meta?.envId ?? '';
    const elements: CseSerializedValue[] = meta?.elements ?? [];

    // Same Python list object (same stable id) must map to the same JS array so
    // Layout.values memoization produces one DataArray box, not one per binding.
    if (listCache.has(listId)) return listCache.get(listId);

    // Build a real JS array — isDataArray() checks Array.isArray + own 'id' + own 'environment'.
    const arr: any = elements.map(el => toJsValue(el, envMap, closureCache, listCache));
    arr.id = `list_${listId}`;
    arr.environment = envMap.get(envId) ?? null;

    listCache.set(listId, arr);
    return arr;
  }

  if (/closure|function|lambda|method/.test(label) && (v.metadata as any)?.closureFrameId) {
    const meta = v.metadata as any;
    const closureEnvId: string = meta?.closureFrameId ?? '';
    const params: string[] = meta?.params ?? [];
    const funcName: string = meta?.funcName ?? v.displayValue.split('(')[0] ?? 'fn';

    // Same logical Python closure (same name + defining env + params) must map to the exact same
    // JS object so Layout.values memoization (keyed by object identity) returns one FnValue circle.
    // Without this, each binding that holds the same closure creates a separate JS object → two
    // FnValue instances, the one in the outer frame staying at (0,0) forever.
    const cacheKey = `${funcName}@${closureEnvId}@${params.join(',')}`;
    if (closureCache.has(cacheKey)) return closureCache.get(cacheKey);

    const fakeFn: any = function SnapshotClosure() {};
    fakeFn.id = `snap_${++_closureSeq}_${closureEnvId}`;
    fakeFn.environment = envMap.get(closureEnvId) ?? null;
    fakeFn.functionName = `${funcName}(${params.join(', ')}) => {}`;
    fakeFn.predefined = false;
    fakeFn.node = makeStubNode(params);
    fakeFn.originalNode = fakeFn.node;
    fakeFn.toString = () => `function ${funcName}(${params.join(', ')}) { [Python] }`;
    closureCache.set(cacheKey, fakeFn);
    return fakeFn;
  }

  // Fallback: render as a string primitive (shows as PrimitiveValue)
  return v.displayValue;
}

/** Build a duck-typed stack that satisfies the IStack interface used by ControlStack/StashStack. */
function makeFakeStack<T>(items: T[]) {
  const storage = [...items];
  const stack = {
    push: (...newItems: T[]) => {
      storage.push(...newItems);
    },
    pop: () => storage.pop(),
    peek: () => (storage.length > 0 ? storage[storage.length - 1] : undefined),
    size: () => storage.length,
    isEmpty: () => storage.length === 0,
    getStack: () => [...storage],
    some: (pred: (v: T) => boolean) => storage.some(pred),
    setTo: (other: any) => {
      storage.length = 0;
      storage.push(...other.getStack());
    },
    // Control-specific extras
    canAvoidEnvInstr: () => true,
    copy: () => makeFakeStack([...storage]),
  };
  return stack;
}

export type SnapshotAdapterResult = {
  envTree: EnvTree;
  fakeControl: Control;
  fakeStash: Stash;
};

export function buildFakeEnvTreeFromSnapshot(snapshot: CseSnapshot): SnapshotAdapterResult {
  // py-slang has three top-level envs: global (tail=null), prelude (tail=null, built-ins),
  // and programEnvironment (tail=prelude). We hide the prelude frame — it's noisy (full of
  // built-in functions) and Source CSE Machine also hides it (via removePreludeEnv).
  // Instead we reparent any child of prelude directly to global, matching Source's behaviour.
  const rawFrames = snapshot.environments;
  const globalFrame = rawFrames.find(
    (f: CseSerializedEnvFrame) => f.name === 'global' && f.parentId === null,
  );
  const preludeFrame = rawFrames.find(
    (f: CseSerializedEnvFrame) => f.name === 'prelude' && f.parentId === null,
  );
  const frames = (() => {
    if (!globalFrame) return rawFrames;
    if (!preludeFrame) {
      // No prelude env serialized (ch1: misc+math preludes are empty strings, so no prelude env
      // is ever pushed onto the call stack). Any orphaned top-level frame — i.e. a frame other
      // than global that also has parentId=null because its tail was undefined — must be
      // reparented to global so EnvTree.insert doesn't silently drop it.
      return rawFrames.map((f: CseSerializedEnvFrame) =>
        f !== globalFrame && f.parentId === null ? { ...f, parentId: globalFrame.id } : f,
      );
    }
    return rawFrames
      .filter((f: CseSerializedEnvFrame) => f !== preludeFrame)
      .map((f: CseSerializedEnvFrame) =>
        f.parentId === preludeFrame.id ? { ...f, parentId: globalFrame.id } : f,
      );
  })();

  // One cache per snapshot render: same logical Python closure/list → same JS object,
  // so Layout.values memoization (keyed by object identity) produces one canvas box.
  const closureCache = new Map<string, unknown>();
  const listCache = new Map<string | number, unknown>();

  // ── Pass 1: create bare Environment objects ─────────────────────────────
  const envMap = new Map<string, Environment>();
  for (const f of frames) {
    // Frame.tsx accesses entries[0][0] for 'global' env without guarding for empty heads.
    // py-slang's global env has no head bindings (builtins live in nativeStorage), so we
    // pre-populate the same sentinel Source uses to keep Frame's constructor from crashing.
    const head: Record<string, unknown> =
      f.name === 'global' ? { [Config.GlobalFrameDefaultText]: Symbol() } : {};
    const env = {
      id: f.id,
      name: f.name,
      head,
      tail: null as Environment | null,
      heap: new Heap(),
    } as unknown as Environment;
    envMap.set(f.id, env);
  }

  // ── Pass 2: wire tail (parent) links ────────────────────────────────────
  for (const f of frames) {
    if (f.parentId) {
      const parent = envMap.get(f.parentId);
      if (parent) (envMap.get(f.id) as any).tail = parent;
    }
  }

  // ── Pass 3a: populate non-closure values ────────────────────────────────
  // Done first so the envMap is complete when closures look up their environments.
  // Use Object.defineProperty to preserve const (writable:false) vs let (writable:true)
  // so Frame.tsx renders := vs : correctly.
  for (const f of frames) {
    const env = envMap.get(f.id)!;
    for (const b of f.bindings) {
      if (!/closure|function|lambda|method/i.test(b.value.label)) {
        Object.defineProperty(env.head, b.name, {
          value: toJsValue(b.value, envMap, closureCache, listCache),
          writable: !b.isConst,
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  // ── Pass 3b: populate closure values ────────────────────────────────────
  for (const f of frames) {
    const env = envMap.get(f.id)!;
    for (const b of f.bindings) {
      if (
        /closure|function|lambda|method/i.test(b.value.label) &&
        (b.value.metadata as any)?.closureFrameId
      ) {
        const val = toJsValue(b.value, envMap, closureCache, listCache);
        Object.defineProperty(env.head, b.name, {
          value: val,
          writable: !b.isConst,
          enumerable: true,
          configurable: true,
        });
        // If this closure was defined in a different frame than where it is bound
        // (e.g. a lambda returned from a function), add it to the defining frame's heap.
        // Source CSE Machine's getUnreferencedObjects() will then create a dummy binding
        // in that dead frame, making isMainReference() return true and positioning the
        // FnValue circle correctly beside the dead frame instead of at (0,0).
        const definingEnv = (val as any)?.environment;
        if (definingEnv && definingEnv !== env) {
          definingEnv.heap.add(val);
        }
      }
    }
  }

  // ── Pass 3c: populate anonymous heap objects ─────────────────────────────
  // Closures serialized in heapObjects are NOT bound to any name — they were placed
  // directly in the frame's heap by the Closure constructor (e.g. a lambda returned
  // from a function before assignment).  Adding them to env.heap lets
  // getUnreferencedObjects() find them and render the dangling-arrow visualization
  // that appears in dead frames for short-lived closures.
  for (const f of frames) {
    const env = envMap.get(f.id)!;
    for (const sv of f.heapObjects ?? []) {
      const val = toJsValue(sv, envMap, closureCache, listCache);
      if (val != null) env.heap.add(val as any);
    }
  }

  // ── Pass 4: build EnvTree using the actual EnvTree class ────────────────
  // EnvTree.insert() uses object identity as the map key, so we must insert
  // environments in parent-before-child order.
  const envTree = new EnvTree();
  const rootFrames = frames.filter((f: CseSerializedEnvFrame) => !f.parentId);
  for (const f of rootFrames) {
    envTree.insert(envMap.get(f.id)!);
  }

  // Insert child frames in parent-before-child order using a progress-based loop
  // so arbitrarily deep chains (child serialized before parent) are handled correctly.
  const inserted = new Set(rootFrames.map((f: CseSerializedEnvFrame) => f.id));
  let pending = frames.filter((f: CseSerializedEnvFrame) => !!f.parentId);
  let progress = true;
  while (pending.length > 0 && progress) {
    progress = false;
    const next: CseSerializedEnvFrame[] = [];
    for (const frame of pending) {
      if (frame.parentId && inserted.has(frame.parentId)) {
        envTree.insert(envMap.get(frame.id)!);
        inserted.add(frame.id);
        progress = true;
      } else {
        next.push(frame);
      }
    }
    pending = next;
  }

  // ── Build fake Control (top-first in snapshot → reverse for stack order) ─
  const controlItems = [...snapshot.control].reverse().map(instr => {
    const meta = instr.metadata as any;

    // ENVIRONMENT instructions: build a fake EnvInstr so the renderer draws an
    // arrow from the control item to the frame it will restore.
    // py-slang uses metadata.envId; js-slang sends displayText='ENVIRONMENT' + envId.
    if (
      (instr.displayText.toLowerCase() === 'environment' ||
        meta?.instrType === 'env' ||
        meta?.instrType === 'ENVIRONMENT') &&
      meta?.envId
    ) {
      const targetEnv = envMap.get(meta.envId as string);
      if (targetEnv) {
        return { instrType: InstrType.ENVIRONMENT, env: targetEnv, srcNode: { loc: undefined } };
      }
    }

    const loc =
      meta?.startLine !== undefined
        ? {
            start: { line: meta.startLine as number },
            end: { line: (meta.endLine ?? meta.startLine) as number },
          }
        : undefined;

    // ── Animation-aware reconstruction (js-slang conductor mode) ─────────────
    // When js-slang serializes control items it embeds instrType / nodeType in
    // metadata so the animation system can dispatch on the real type instead of
    // treating everything as a generic Identifier.

    if (meta?.instrType !== undefined) {
      // Reconstruct a duck-typed instruction object for the animation system.
      // Note: no `type` field — isInstr() detects these via instrType, and
      // getControlItemComponent dispatches on instrType for display (reads
      // symbol / numOfArgs / arity which we forward here).
      return {
        instrType: meta.instrType as InstrType,
        symbol: meta.symbol as string | undefined,
        numOfArgs: meta.numOfArgs as number | undefined,
        arity: meta.arity as number | undefined,
        srcNode: { loc },
      };
    }

    if (meta?.nodeType) {
      // Keep type:'Identifier' so getControlItemComponent uses astToString(node)
      // which returns node.name — i.e. the display text we want.  Store the real
      // AST type in __snapAnimType so CseMachineAnimation.handleNode can dispatch
      // correctly for animations without breaking the control-stack display.
      const nodeType = meta.nodeType as string;
      const bodyLength: number = (meta.bodyLength as number | undefined) ?? 0;
      const bodyNodeTypes: (string | undefined)[] =
        (meta.bodyNodeTypes as (string | undefined)[] | undefined) ?? [];

      // Build a body array for block-like nodes so handleNode can check body.length.
      // Stub elements' types drive the recursive handleNode call when body.length === 1.
      // ExpressionStatement delegates to .expression, so give it a BinaryExpression
      // stub that lands in the ControlExpansionAnimation case.
      const body = Array.from({ length: bodyLength }, (_, i) => {
        const t = bodyNodeTypes[i] ?? 'VariableDeclaration';
        if (t === 'ExpressionStatement')
          return { type: t, expression: { type: 'BinaryExpression' } };
        return { type: t };
      });

      return {
        type: 'Identifier' as const,
        name: instr.displayText,
        loc,
        __snapAnimType: nodeType,
        __snapBody: body,
      } as any;
    }

    // ── Fallback (py-slang or untyped items) ──────────────────────────────────
    // isNode() accepts any object with a .type field; the animation system will
    // treat this as a generic identifier lookup (and the try/catch in Layout
    // absorbs any animation failure without breaking the visualisation).
    return { type: 'Identifier' as const, name: instr.displayText, loc };
  });

  // py-slang now emits real ENVIRONMENT instructions (pointing to the caller's env) for
  // every function call. Those are picked up by collectRootEnvIds Root 3, keeping all
  // call-stack frames alive without any synthetic injection here.
  const fakeControl = makeFakeStack(controlItems) as unknown as Control;

  // ── Build fake Stash ─────────────────────────────────────────────────────
  // The evaluator serializes stash newest-first (rawStash.slice().reverse()), so we must
  // reverse back to oldest-first order to match the real Stash.getStack() convention
  // (index 0 = bottom/oldest, last index = top/newest).  Without this reversal the stash
  // displays backwards and the animation system picks the wrong item as the "closure".
  const stashSv = [...snapshot.stash].reverse();
  const stashItems = stashSv.map(sv => toJsValue(sv, envMap, closureCache, listCache));

  // Stash closures not yet assigned to a name still need to appear in their defining env's heap
  // so getUnreferencedObjects() can render them as an unbound arrow in the program frame —
  // matching the non-conductor CSE machine's behaviour at the step before `assign foo` runs.
  for (let i = 0; i < stashSv.length; i++) {
    const sv = stashSv[i];
    const label = sv.label.toLowerCase();
    if (/closure|function|lambda|method/.test(label) && (sv.metadata as any)?.closureFrameId) {
      const val = stashItems[i];
      const definingEnv = (val as any)?.environment;
      if (definingEnv) {
        definingEnv.heap.add(val);
      }
    }
  }

  const fakeStash = makeFakeStack(stashItems) as unknown as Stash;

  return { envTree, fakeControl, fakeStash };
}
