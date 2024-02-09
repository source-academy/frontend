import { ControlItemComponent } from '../compactComponents/ControlItemComponent';
import { StashItemComponent } from '../compactComponents/StashItemComponent';

export function getNodeValuesFromItem(item: ControlItemComponent | StashItemComponent) {
  return {
    x: item.x(),
    y: item.y(),
    height: item.height(),
    width: item.width()
  };
}