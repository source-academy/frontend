/**
 * The shapes of data that the renderer reads, as plain types of its own.
 *
 * The renderer used to take these types from js-slang (`Environment`, `Frame`, `Value`, `Heap`),
 * which a plugin cannot do: it cannot bundle js-slang. They have the same fields as js-slang's, so
 * js-slang's own objects (which the layout tests still run real programs to get) are accepted
 * wherever one of these is, and the objects that `CseSnapshotAdapter` makes from a snapshot are one
 * of these without js-slang.
 */
import type { ControlItem } from 'js-slang/dist/cse-machine/types';

/** A value that a name is bound to, or that a stash holds; the renderer tells them apart by shape. */

export type Value = any;

/** The bindings of a frame, by name. */
export type Frame = { [name: string]: Value };

/** What a heap holds: an array, a function, a continuation. */

export type HeapObject = any;

/** The objects that were created in an environment (an array, a closure) and are not yet freed. */
export class Heap {
  private storage: Set<HeapObject> | null = null;

  add(...items: HeapObject[]): void {
    this.storage ??= new Set();
    for (const item of items) {
      this.storage.add(item);
    }
  }

  /** Whether `item` is in the heap. */
  contains(item: HeapObject): boolean {
    return this.storage?.has(item) ?? false;
  }

  /** The number of items in the heap. */
  size(): number {
    return this.storage?.size ?? 0;
  }

  /**
   * Removes `item` from this heap and adds it to `otherHeap`; nothing happens if this heap does not
   * contain it. Returns whether the item moved.
   */
  move(item: HeapObject, otherHeap: HeapLike): boolean {
    if (!this.contains(item)) {
      return false;
    }
    this.storage?.delete(item);
    otherHeap.add(item);
    return true;
  }

  /** A copy of the heap's contents. */
  getHeap(): Set<HeapObject> {
    return new Set(this.storage ?? []);
  }
}

/** What the renderer asks of a heap: `Heap`, and js-slang's own, have it. */
export type HeapLike = Pick<Heap, 'add' | 'contains' | 'size' | 'move' | 'getHeap'>;

/** What the renderer reads of a register of the machine (the control or the stash): its items. */
export type RegisterStack<T> = {
  /** The item on top, if there is one. */
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
  /** The items, the one on top last. */
  getStack(): T[];
};

/** The control: the instructions and the program parts that are still to be evaluated. */
export type Control = RegisterStack<ControlItem>;

/** The stash: the values that have been evaluated and are not yet used. */
export type Stash = RegisterStack<Value>;

/** A frame of the environment model, with the environment it extends. */
export type Environment = {
  readonly id: string;
  name: string;
  tail: Environment | null;
  /** The call that made the frame, if the evaluator says (its source text is what is shown). */
  callExpression?: any;
  head: Frame;
  heap: HeapLike;
  thisContext?: Value;
};

/** A frame of the environment model in the tree of the frames, with the frames made from it. */
export class EnvTreeNode {
  private _children: EnvTreeNode[] = [];

  constructor(
    readonly environment: Environment,
    public parent: EnvTreeNode | null,
  ) {}

  get children(): EnvTreeNode[] {
    return this._children;
  }

  resetChildren(newChildren: EnvTreeNode[]): void {
    this._children = [];
    this._children.push(...newChildren);
    newChildren.forEach(c => (c.parent = this));
  }

  addChild(newChild: EnvTreeNode): EnvTreeNode {
    this._children.push(newChild);
    return newChild;
  }
}

/** The tree of the frames: each frame under the one it extends, the global frame at the root. */
export class EnvTree {
  private _root: EnvTreeNode | null = null;
  private map = new Map<Environment, EnvTreeNode>();

  get root(): EnvTreeNode | null {
    return this._root;
  }

  insert(environment: Environment): void {
    const tail = environment.tail;
    if (tail === null) {
      if (this._root === null) {
        this._root = new EnvTreeNode(environment, null);
        this.map.set(environment, this._root);
      }
    } else {
      const parentNode = this.map.get(tail);
      if (parentNode) {
        const childNode = new EnvTreeNode(environment, parentNode);
        parentNode.addChild(childNode);
        this.map.set(environment, childNode);
      }
    }
  }

  getTreeNode(environment: Environment): EnvTreeNode | undefined {
    return this.map.get(environment);
  }
}
