import { OverlayToaster, OverlayToasterProps, Position, Toaster } from '@blueprintjs/core';
import { createRoot } from 'react-dom/client';

/**
 * React Testing Library (@testing-library/react) does not support refs and accessing component
 * instances based on their [Guiding Principles](https://testing-library.com/docs/guiding-principles)
 * and [FAQ](https://testing-library.com/docs/dom-testing-library/faq/).
 * - Thus we have to mock `notification` in our tests from this file (see `src/setupTests.ts`)
 * - This also means we can't test UI changes related to notification toasters since we are mocking
 *   the toaster (e.g. checking that the toast appears in our test UI)
 */
export let notification: Toaster;

const createToaster = async (props?: OverlayToasterProps) => {
  // Workaround no top-level await
  notification = await OverlayToaster.createAsync(props, {
    // See https://github.com/palantir/blueprint/issues/5212#issuecomment-1881229199
    domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster)
  });
};

createToaster({
  position: Position.TOP
});
