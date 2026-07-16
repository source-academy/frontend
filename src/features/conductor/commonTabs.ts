import type { IconName } from '@blueprintjs/icons';
import type React from 'react';

/**
 * Vendored from `@sourceacademy/common-tabs` (plugins PR #25). The frontend consumes these
 * **types only** (every import is `import type`, erased at build time), but the local multi-repo
 * yarn workspace can't link the `portal:` package (an unrelated js-slang↔conductor portal conflict
 * makes `yarn install` fail), so the contract is mirrored here.
 *
 * When PR #3977 lands (it depends on the published `@sourceacademy/common-tabs`), replace imports of
 * this module with `@sourceacademy/common-tabs` — the shapes are identical.
 */
export type Tab = {
  label: string;
  iconName: IconName;
  body: React.ReactElement | null;
  id: string;
  disabled?: boolean;
};

export interface ITabService {
  registerTab(tab: Tab): void;
  unregisterTab(id: string): void;
  showTab(id: string): void;
  hideTab(id: string): void;
}
