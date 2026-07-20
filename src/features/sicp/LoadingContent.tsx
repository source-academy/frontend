import { NonIdealState, Spinner } from '@blueprintjs/core';

function LoadingContent() {
  return <NonIdealState title="Loading Content" icon={<Spinner />} />;
}

export default LoadingContent;
