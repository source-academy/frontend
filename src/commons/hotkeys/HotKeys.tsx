import { getHotkeyHandler, HotkeyItem } from '@mantine/hooks';
import React, { PropsWithChildren } from 'react';

type HotKeysProps = {
  bindings: HotkeyItem[];
};

/**
 * This HOC was created to facilitate the migration out of react-hotkeys in favor of @mantine/hooks useHotkeys,
 * as SideContentCseMachine.tsx and SideContentDataVisualizer still use class-based React.
 *
 * NOTE:
 * - New hotkey implementations should NOT use this component. Use functional React and the useHotkeys hook
 * from @mantine/hooks directly.
 *
 * TODO:
 * - Eventually migrate out of class-based React in the aforementioned components and use useHotkeys directly.
 */
const HotKeys: React.FC<
  PropsWithChildren<
    HotKeysProps & {
      style?: React.CSSProperties;
    }
  >
> = ({ bindings, children, style }) => {
  const handler = getHotkeyHandler(bindings);

  return (
    <div
      tabIndex={-1} // tab index necessary to fire keydown events on div element
      onKeyDown={handler}
      style={style}
    >
      {children}
    </div>
  );
};

export default HotKeys;
