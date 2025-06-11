import { createActions } from 'src/commons/redux/utils';

import type { PersistenceFile } from './PersistenceTypes';

const PersistenceActions = createActions('persistence', {
  persistenceOpenPicker: true,
  persistenceSaveFile: (file: PersistenceFile) => file,
  persistenceSaveFileAs: true,
  persistenceInitialise: true
});

export default PersistenceActions;
