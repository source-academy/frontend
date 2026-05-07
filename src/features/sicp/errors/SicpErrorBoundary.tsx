import { Component } from 'react';

import getSicpError, { SicpErrorType } from './SicpErrors';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

class SicpErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return getSicpError(SicpErrorType.UNEXPECTED_ERROR);
    }

    return this.props.children;
  }
}

export default SicpErrorBoundary;
