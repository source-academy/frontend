import { IPluginDefinition, PluginType } from '@sourceacademy/plugin-directory'; // importing from /dist/types fails for some reason
import { call, fork, put, select } from 'redux-saga/effects';

import { selectDirectoryPluginUrl } from '../../features/directory/flagDirectoryPluginUrl';
import PluginDirectoryActions from '../../features/directory/PluginDirectoryActions';
import { PluginDirectoryState } from '../../features/directory/PluginDirectoryTypes';
import { OverallState } from '../application/ApplicationTypes';
import { combineSagaHandlers } from '../redux/utils';

export function* getPluginDefinitionSaga(pluginId: string) {
  const directory: PluginDirectoryState = yield select(
    (state: OverallState) => state.pluginDirectory
  );
  return directory.pluginMap[pluginId];
}

export function* getWebPluginSaga(pluginId: string) {
  const pluginDefinition: IPluginDefinition = yield getPluginDefinitionSaga(pluginId);
  if (!pluginDefinition) return;
  return pluginDefinition.resolutions[PluginType.WEB];
}

const pluginDirectoryHandlers = combineSagaHandlers({
  [PluginDirectoryActions.fetchPlugins.type]: function* () {
    const url = yield select(selectDirectoryPluginUrl);
    const response = yield call(fetch, url);
    if (!response.ok) {
      throw new Error(`Can't retrieve plugin directory: ${response.status}`);
    }
    const result: IPluginDefinition[] = yield call([response, 'json']);
    yield put(PluginDirectoryActions.setPlugins(result));
  }
});

function* PluginDirectorySaga() {
  yield fork(pluginDirectoryHandlers);
  yield put(PluginDirectoryActions.fetchPlugins());
}

export default PluginDirectorySaga;
