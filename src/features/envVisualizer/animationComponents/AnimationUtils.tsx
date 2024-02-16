import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { Binding } from '../compactComponents/Binding';
import { Frame } from '../compactComponents/Frame';
import { StashItemComponent } from '../compactComponents/StashItemComponent';

export function getNodePositionFromItem(item: ControlItemComponent | StashItemComponent | Frame) {
  return {
    x: item.x(),
    y: item.y(),
    height: item.height(),
    width: item.width()
  };
}

// Given a current frame, find a binding by traversing the enclosing environments (frames).
export function lookup(currFrame: Frame, bindingName: string): Binding | undefined {
  while (currFrame.parentFrame !== undefined) {
    const binding = currFrame.bindings.find(b => b.keyString === bindingName);
    if (binding != undefined || currFrame.parentFrame === undefined) {
      return binding;
    }
  }
}
