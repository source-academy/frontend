import React from 'react';
import { Group } from 'react-konva';
import { Text } from 'react-konva';
import { Memory as CMemory } from 'src/ctowasm/dist';

import { Visible } from '../../components/Visible';
import { defaultTextColor } from '../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../config/CControlStashMemoryConfig';
import { ShapeDefaultProps } from '../config/CCSEMachineConfig';
import { CseMachine } from '../CseMachine';

export class Memory extends Visible {
  textProps = {
    fill: defaultTextColor(),
    padding: CControlStashMemoryConfig.ControlItemTextPadding,
    fontFamily: CControlStashMemoryConfig.FontFamily,
    fontSize: CControlStashMemoryConfig.FontSize,
    fontStyle: CControlStashMemoryConfig.FontStyle,
    fontVariant: CControlStashMemoryConfig.FontVariant
  };

  constructor(memory: CMemory) {
    super();
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++} ref={this.ref}>
        <React.Fragment key={CseMachine.key++}>
          <Text
            {...ShapeDefaultProps}
            {...this.textProps}
            text={'FUKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'}
            key={CseMachine.key++}
          />
        </React.Fragment>
      </Group>
    );
  }
}
