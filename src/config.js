import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const homeDirectory = os.homedir();
export const configurationDirectory = path.join(homeDirectory, '.config', 'tracksim-linux');
export const downloadDirectory = path.join(configurationDirectory, 'client');
const configurationFilePath = path.join(configurationDirectory, 'config.json');

const defaultInstallation = {
  data: path.join(homeDirectory, '.local', 'share', 'truckersmp-cli', 'Euro Truck Simulator 2', 'data'),
  prefix: path.join(homeDirectory, '.local', 'share', 'truckersmp-cli', 'Euro Truck Simulator 2', 'prefix', 'pfx')
};

export function getConfiguration() {
  if (fs.existsSync(configurationFilePath)) {
    return fs.readJsonSync(configurationFilePath);
  }
  return null;
}

export function saveConfiguration(configurationData) {
  fs.ensureDirSync(configurationDirectory);
  fs.writeJsonSync(configurationFilePath, configurationData, { spaces: 2 });
}

export function createDefaultConfiguration() {
  console.log(chalk.blueBright('\n--- TrackSim Linux Setup ---\n'));

  if (fs.existsSync(defaultInstallation.data) && fs.existsSync(defaultInstallation.prefix)) {
    console.log(chalk.green('Auto-detected default TruckersMP installation.'));
  } else {
    console.log(chalk.yellow('Could not auto-detect truckersmp-cli. Please ensure it is installed and you have run it at least once.'));
  }

  const configurationData = { ets2DataDir: defaultInstallation.data, ets2PrefixDir: defaultInstallation.prefix };
  saveConfiguration(configurationData);
  
  console.log(chalk.greenBright('\nConfiguration saved!\n'));
  return configurationData;
}
