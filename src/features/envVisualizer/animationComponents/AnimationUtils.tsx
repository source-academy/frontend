import { Binding } from '../compactComponents/Binding';
import { Frame } from '../compactComponents/Frame';
import { Visible } from '../components/Visible';

export function getNodePositionFromItem(item: Visible) {
  return {
    x: item.x(),
    y: item.y(),
    height: item.height(),
    width: item.width()
  };
}

// Given a current frame, find a binding by traversing the enclosing environments (frames).
export function lookupBinding(currFrame: Frame, bindingName: string): [Frame, Binding] {
  let frame: Frame | undefined = currFrame;
  while (frame !== undefined) {
    const binding = frame.bindings.find(b => b.keyString.split(':')[0] === bindingName);
    if (binding) {
      return [frame, binding];
    }
    frame = frame.parentFrame;
  }
  throw new Error(
    `Error: Binding with name "${bindingName}" cannot be found within the environment!`
  );
}
