import { IVisible } from '../../CseMachineTypes';
import type { GenericArrow } from './GenericArrow';

/** Manages arrow selection state */
class ArrowSelectionManager {
  private selectedArrow: GenericArrow<IVisible, IVisible> | null = null;

  getSelected(): GenericArrow<IVisible, IVisible> | null {
    return this.selectedArrow;
  }

  setSelected(arrow: GenericArrow<IVisible, IVisible> | null): void {
    this.selectedArrow = arrow;
  }

  clearSelection(): GenericArrow<IVisible, IVisible> | null {
    const oldArrow = this.selectedArrow;
    this.selectedArrow = null;
    return oldArrow;
  }

  isSelected(arrow: GenericArrow<IVisible, IVisible>): boolean {
    return this.selectedArrow === arrow;
  }
}

export const arrowSelection = new ArrowSelectionManager();
