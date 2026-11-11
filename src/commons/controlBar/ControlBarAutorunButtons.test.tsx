import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import ControlBarAutorunButtons from './ControlBarAutorunButtons';

const conductorEnabled = vi.hoisted(() => ({ value: true }));

vi.mock('src/features/conductor/flagConductorEnable', () => ({
  useConductorEnable: () => conductorEnabled.value,
}));

vi.mock('../utils/Hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils/Hooks')>()),
  useResponsive: () => ({ isMobileBreakpoint: false }),
}));

const handlers = {
  handleDebuggerPause: vi.fn(),
  handleDebuggerReset: vi.fn(),
  handleDebuggerResume: vi.fn(),
  handleEditorEval: vi.fn(),
  handleInterruptEval: vi.fn(),
};

function renderButtons() {
  return render(
    <ControlBarAutorunButtons
      {...handlers}
      isEntrypointFileDefined
      isDebugging={false}
      isRunning
      key="autorun"
      sourceChapter={4}
    />,
  );
}

beforeEach(() => {
  conductorEnabled.value = true;
  vi.clearAllMocks();
});

test('does not show Pause under Conductor, where beginDebuggerPause is not handled', () => {
  renderButtons();

  expect(screen.queryByText('Pause')).toBeNull();
  expect(screen.getByText('Stop')).toBeDefined();
});

test('still shows Pause on the legacy evaluator', () => {
  conductorEnabled.value = false;

  renderButtons();

  expect(screen.getByText('Pause')).toBeDefined();
  expect(screen.queryByText('Stop')).toBeNull();
});
