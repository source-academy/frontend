import { userSettingsToJson } from './GameSaveHelper';
import { loadData, saveData } from './GameSaveRequests';
import { FullSaveState, SettingsJson } from './GameSaveTypes';

export type SettingsSaveManager = {
  loadSettings: () => Promise<void> | void;
  saveSettings: (settingsJson: SettingsJson) => Promise<void>;
  getSettings: () => SettingsJson;
};

/**
 * A mini save manager to just load and save settings
 */
export function createSettingsManager() {
  let loadedGameState: FullSaveState;

  const loadSettings = async () => {
    loadedGameState = await loadData();
  };

  const saveSettings = async (settingsJson: SettingsJson) => {
    loadedGameState = userSettingsToJson(loadedGameState, settingsJson);
    await saveData(loadedGameState);
  };

  const getSettings = () => loadedGameState.userSaveState.settings;

  return { loadSettings, saveSettings, getSettings };
}
