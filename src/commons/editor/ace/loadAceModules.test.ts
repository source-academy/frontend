import { describe, expect, test } from 'vitest';

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

  test('a mode that Ace does not have is reported, not awaited forever', async () => {
    expect(await loadAceModule('ace/mode/not_a_language')).toBe(false);
  });
});
