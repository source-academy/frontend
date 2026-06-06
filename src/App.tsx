import { QueryClientProvider } from '@tanstack/react-query';

import ApplicationWrapper from './commons/application/ApplicationWrapper';
import { queryClient } from './queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationWrapper />
    </QueryClientProvider>
  );
}

export default App;
