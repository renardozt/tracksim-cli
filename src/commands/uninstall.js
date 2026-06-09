import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getConfiguration, configurationDirectory } from '../config.js';

export default function uninstallCommand() {
  try {
    const configurationData = getConfiguration();
    if (!configurationData) {
      console.log(chalk.yellow('TrackSim does not appear to be installed (no configuration found).'));
      return;
    }

    console.log(chalk.blueBright('Starting uninstallation...'));

    const targetTelemetryDllPath = path.join(configurationData.ets2DataDir, 'bin', 'win_x64', 'plugins', 'telemetry.dll');
    if (fs.existsSync(targetTelemetryDllPath)) {
      fs.removeSync(targetTelemetryDllPath);
      console.log(chalk.greenBright('✓ Removed telemetry.dll from plugins folder.'));
    }

    const gameProgramDataDirectory = path.join(configurationData.ets2PrefixDir, 'drive_c', 'ProgramData', 'TrackSim');
    if (fs.existsSync(gameProgramDataDirectory)) {
      fs.removeSync(gameProgramDataDirectory);
      console.log(chalk.greenBright('✓ Removed TrackSim directory from ProgramData.'));
    }

    if (fs.existsSync(configurationDirectory)) {
      fs.removeSync(configurationDirectory);
      console.log(chalk.greenBright('✓ Removed local configuration and downloaded files.'));
    }

    console.log(chalk.magenta('\nUninstallation finished!'));

  } catch (uninstallationError) {
    console.error(chalk.red('\nError:'), uninstallationError.message);
  }
}
