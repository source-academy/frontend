import { ControlItemComponent } from '../components/ControlItemComponent';
import { StashItemComponent } from '../components/StashItemComponent';
import { AnimatedTextboxComponent } from './AnimationComponents';
import { getNodePositionFromItem } from './AnimationUtils';

export class LiteralAnimation extends AnimatedTextboxComponent {
  constructor(
    controlItem: ControlItemComponent,
    private stashItem: StashItemComponent
  ) {
    super(
      getNodePositionFromItem(controlItem),
      getNodePositionFromItem(stashItem),
      controlItem.text
    );
  }

  async animate() {
    this.stashItem.ref.current.hide();
    await super.animate();
    this.ref.current?.hide();
    this.stashItem.ref.current?.show();
  }
}
