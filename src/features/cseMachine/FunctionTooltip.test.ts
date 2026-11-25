import { describe, expect, it, vi } from 'vitest';

// jsdom has no canvas, so text would measure as empty and never be truncated. A canvas whose
// characters are 7 pixels wide lets the tooltip be measured, as in a browser.
vi.hoisted(() => {
  HTMLCanvasElement.prototype.getContext = (() => ({
    font: '',
    measureText: (text: string) => ({ width: text.length * 7 }),
  })) as any;
});

import { Config } from './CseMachineConfig';
import { getFunctionTooltipMaxHeight, truncateFunctionTooltip } from './CseMachineUtils';

describe('the description of a function with local and global names', () => {
  const tooltip = ['params: (x)', 'locals: y, h', 'globals: g', 'body: return y'].join('\n');

  it('keeps its body: each line of names has room of its own', () => {
    expect(
      truncateFunctionTooltip(
        tooltip,
        Config.FnDescriptionMaxWidth,
        getFunctionTooltipMaxHeight(2),
      ),
    ).toBe(tooltip);
  });

  it('would lose its body without that room', () => {
    expect(
      truncateFunctionTooltip(tooltip, Config.FnDescriptionMaxWidth, Config.FnDescriptionMaxHeight),
    ).toBe(['params: (x)', 'locals: y, h', 'globals: g', Config.Ellipsis].join('\n'));
  });

  it('is truncated as before when it has no such lines', () => {
    expect(getFunctionTooltipMaxHeight(0)).toBe(Config.FnDescriptionMaxHeight);
  });
});
