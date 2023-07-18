import { OverlayToaster, OverlayToasterProps, Position } from '@blueprintjs/core';
import { createRoot } from 'react-dom/client';

/**
 * Blueprintjs v4 OverlayToaster still uses ReactDOM.render, which is deprecated in React v18.
 * They plan to migrate out of ReactDOM.render in v6. Temporary custom workaround `Toaster.create` as follows.
 *
 * https://github.com/palantir/blueprint/issues/5212
 *
 * SEPARATE NOTE: `notification` is intentionally exported from this separate file in order for us to mock it in `NotificationsHelper.tsx`
 * - `ReactDOM.render` was deprecated in react v18, which previously returned the instance of the class component `OverlayToaster` from Blueprint v4
 * - the new React `createRoot.render` returns `void`
 * - we are able to circumvent this by accessing the `OverlayToaster` instance from the `ref` prop based on the linked GitHub suggestion above
 * - HOWEVER, React Testing Library (@testing-library/react) does not support refs and accessing component instances based on their [Guiding Principles](https://testing-library.com/docs/guiding-principles) and [FAQ](https://testing-library.com/docs/dom-testing-library/faq/)
 * - thus we have to mock `notification` in our tests from this file (see `src/setupTests.ts`)
 * - this also means we can't test UI changes related to notification toasters since we are mocking the toaster (e.g. checking that the toast appears in our test UI)
 */
export let notification: OverlayToaster;

const createToaster = (props?: OverlayToasterProps, container = document.body) => {
  const containerElement = document.createElement('div');
  container.appendChild(containerElement);
  const root = createRoot(containerElement);

  root.render(
    <OverlayToaster
      {...props}
      usePortal={false}
      ref={instance => {
        notification = instance!;
      }}
    />
  );
};

createToaster({
  position: Position.TOP
});
