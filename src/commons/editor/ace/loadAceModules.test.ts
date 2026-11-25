import { config } from 'ace-builds/src-noconflict/ace';
import { describe, expect, test, vi } from 'vitest';

import { isAceModuleDefined, loadAceModule, loadAceModules } from './loadAceModules';

describe('loadAceModule', () => {
  test('loads a stock mode that no code names', async () => {
    expect(isAceModuleDefined('ace/mode/ocaml')).toBe(false);
    expect(await loadAceModule('ace/mode/ocaml')).toBe(true);
    expect(isAceModuleDefined('ace/mode/ocaml')).toBe(true);
  });

  test('a folding mode is defined by loading the mode that contains it', async () => {
    await loadAceModules(['ace/mode/python']);
    expect(isAceModuleDefined('ace/mode/folding/pythonic')).toBe(true);
  });

  test('a mode that is already defined needs no loading', async () => {
    expect(await loadAceModule('ace/mode/text')).toBe(true);
  });

  test('a mode whose chunk cannot be fetched is reported, not awaited forever', async () => {
    const dynamicModules = (config as unknown as { dynamicModules: Record<string, unknown> })
      .dynamicModules;
    dynamicModules['ace/mode/unreachable'] = () => Promise.reject(new Error('chunk failed'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await loadAceModule('ace/mode/unreachable')).toBe(false);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
    delete dynamicModules['ace/mode/unreachable'];
  });

  test('a mode that Ace does not have is reported, not awaited forever', async () => {
    expect(await loadAceModule('ace/mode/not_a_language')).toBe(false);
  });
});
