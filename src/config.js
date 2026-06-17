import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const homeDirectory = os.homedir();
const isWin = os.platform() === 'win32';

export const configurationDirectory = isWin 
  ? path.join(process.env.APPDATA || path.join(homeDirectory, 'AppData', 'Roaming'), 'tracksim-cli')
  : path.join(homeDirectory, '.config', 'tracksim-cli');

export const downloadDirectory = path.join(configurationDirectory, 'client');
const configurationFilePath = path.join(configurationDirectory, 'config.json');

/**
 * Loads the configuration from the config.json file.
 * @returns {Object} The configuration object, or an empty object if not found.
 */
export function getConfiguration() {
  if (fs.existsSync(configurationFilePath)) {
    return fs.readJsonSync(configurationFilePath);
  }
  return {};
}

/**
 * Saves the configuration to the config.json file.
 * @param {Object} configurationData The data to save.
 */
export function saveConfiguration(configurationData) {
  fs.ensureDirSync(configurationDirectory);
  fs.writeJsonSync(configurationFilePath, configurationData, { spaces: 2 });
}

