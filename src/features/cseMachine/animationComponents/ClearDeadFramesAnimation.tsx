import React from 'react';
import { Group } from 'react-konva';

import { Frame } from '../components/Frame';
import { Config } from '../CseMachineConfig';
import { defaultActiveColor } from '../CseMachineUtils';
import { Animatable } from './base/Animatable';
import { AnimatedRectComponent } from './base/AnimationComponents';
import { getNodePosition } from './base/AnimationUtils';

/**
 * Animation for the `env` instruction.
 * Moves the frame border from previous environment frame to new one.
 */
export class ClearDeadFramesAnimation extends Animatable {
    private frameAnimation: AnimatedRectComponent;
    private newFrame: Frame;
    
    constructor(changedFramePairs: Frame[][]) {
        super();
        const oldFramePosition = getNodePosition(changedFramePairs[0][0]);
        this.frameAnimation = new AnimatedRectComponent({
            ...oldFramePosition,
            cornerRadius: Config.FrameCornerRadius,
            stroke: defaultActiveColor()
        })
        this.newFrame = changedFramePairs[0][1];
  }

    draw(): React.ReactNode {
        return (
        <Group key={Animatable.key--} ref={this.ref}>
            {this.frameAnimation.draw()}
        </Group>
        );
    }

    async animate() {
        console.log("gang")
        const newPosition = getNodePosition(this.newFrame);
        await this.frameAnimation.animateTo({ ...newPosition}, { duration: 10000 });
        // this.destroy();
    }

    destroy() {
        this.ref.current?.hide();
        this.frameAnimation.destroy();
    }
}


// import React from 'react';
// import { Group } from 'react-konva';

// import { Frame } from '../components/Frame';
// import { Config } from '../CseMachineConfig';
// import { defaultActiveColor } from '../CseMachineUtils';
// import { Animatable } from './base/Animatable';
// import { AnimatedRectComponent } from './base/AnimationComponents';
// import { getNodePosition } from './base/AnimationUtils';

// /**
//  * Animation for the `env` instruction.
//  * Moves the frame border from previous environment frame to new one.
//  */
// export class ClearDeadFramesAnimation extends Animatable {
//     private frameAnimations: AnimatedRectComponent[];
//     private newFrames: Frame[];

//     // private frameAnimation: AnimatedRectComponent;
//     // private tempRect: AnimatedRectComponent; // this one just hides the blue temporarily

//   constructor(changedFramePairs: Frame[][]) {
//     super();
//     this.frameAnimations = [];
//     this.newFrames = [];
//     for (const framePair of changedFramePairs) {
//         const oldFramePosition = getNodePosition(framePair[0]);
//         this.frameAnimations.push(
//             new AnimatedRectComponent({
//                 ...oldFramePosition,
//                 cornerRadius: Config.FrameCornerRadius,
//                 stroke: defaultActiveColor()
//             })
//         )
//         this.newFrames.push(framePair[1]);
//     }
//     console.log(this.frameAnimations)
//     console.log(this.newFrames)
//     // const currFramePosition = getNodePosition(currFrame);
//     // this.tempRect = new AnimatedRectComponent({
//     //   ...currFramePosition,
//     //   cornerRadius: Config.FrameCornerRadius
//     // });
//     // const prevFramePosition = getNodePosition(prevFrame);
//     // this.frameAnimation = new AnimatedRectComponent({
//     //   ...prevFramePosition,
//     //   cornerRadius: Config.FrameCornerRadius,
//     //   stroke: defaultActiveColor()
//     // });
//   }

//   draw(): React.ReactNode {
//     return (
//       <Group key={Animatable.key--} ref={this.ref}>
//         {this.frameAnimations[0].draw()}
//       </Group>
//     );
//   }

//   async animate() {
//     // for (let frameIdx = 0; frameIdx < this.frameAnimations.length; frameIdx++) {
//     //     const newFramePosition = getNodePosition(this.newFrames[frameIdx]);
//     //     await this.frameAnimations[frameIdx].animateTo({
//     //             ...newFramePosition
//     //         }, {duration:1.2}
//     //     )
//     // }
//     const newPosition = getNodePosition(this.newFrames[0]);
//     await this.frameAnimations[0].animateTo(
//         {x: newPosition.x, y: newPosition.y}
//     )
//     this.destroy()
//     // move frame border to correct position
//     // const newPosition = getNodePosition(this.currFrame);
//     // await this.frameAnimation.animateTo(
//     //   {
//     //     x: newPosition.x - strokeIncrease / 2,
//     //     y: newPosition.y - strokeIncrease / 2,
//     //     height: newPosition.height + strokeIncrease,
//     //     width: newPosition.width + strokeIncrease
//     //   },
//     //   { duration: 1.2 }
//     // );
//     // this.tempRect.ref.current?.hide();
//     // await this.frameAnimation.animateTo({ ...newPosition, strokeWidth }, { duration: 1 });
//     // this.destroy();
//   }

//   destroy() {
//     this.ref.current?.hide();
//     for (const frameAnim of this.frameAnimations) {
//         frameAnim.destroy();
//     }
//     // this.frameAnimation.destroy();
//     // this.tempRect.destroy();
//   }
// }
