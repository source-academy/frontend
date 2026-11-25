import { describe, expect, test } from 'vitest';

import { defaultSideContentManager } from '../application/ApplicationTypes';
import { alertSideContent, visitSideContent } from './SideContentActions';
import { SideContentReducer } from './SideContentReducer';
import { SideContentType } from './SideContentTypes';

describe('alertSideContent', () => {
  test('alerts a tab that is not open', () => {
    const state = SideContentReducer(
      defaultSideContentManager,
      alertSideContent(SideContentType.htmlDisplay, 'playground'),
    );
    expect(state.playground.alerts).toEqual([SideContentType.htmlDisplay]);
  });

  test('does not alert the tab that is open', () => {
    const open = SideContentReducer(
      defaultSideContentManager,
      visitSideContent(SideContentType.htmlDisplay, undefined, 'playground'),
    );
    const state = SideContentReducer(
      open,
      alertSideContent(SideContentType.htmlDisplay, 'playground'),
    );
    expect(state.playground.alerts).toEqual([]);
  });

  test('alerts a tab only once', () => {
    const once = SideContentReducer(
      defaultSideContentManager,
      alertSideContent(SideContentType.htmlDisplay, 'playground'),
    );
    const twice = SideContentReducer(
      once,
      alertSideContent(SideContentType.htmlDisplay, 'playground'),
    );
    expect(twice.playground.alerts).toEqual([SideContentType.htmlDisplay]);
  });

  test('visiting a tab clears its alert', () => {
    const alerted = SideContentReducer(
      defaultSideContentManager,
      alertSideContent(SideContentType.htmlDisplay, 'playground'),
    );
    const state = SideContentReducer(
      alerted,
      visitSideContent(SideContentType.htmlDisplay, undefined, 'playground'),
    );
    expect(state.playground.alerts).toEqual([]);
  });
});
