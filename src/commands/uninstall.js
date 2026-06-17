import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getConfiguration, saveConfiguration, configurationDirectory } from '../config.js';
import { resolveGameSetup, getPluginsDirectory, getProgramDataDirectory } from '../gamePathResolver.js';
import { removeFileOrDirIfExists } from '../utils.js';
import { FILES } from '../constants.js';

export default function uninstallCommand(gameId, options) {
  try {
    const configurationData = getConfiguration();
    
    // 1. Resolve Setup
    const setup = resolveGameSetup(gameId, options, configurationData);

    console.log(chalk.blueBright(`Starting uninstallation for ${setup.game.name}...`));

    // 2. Remove telemetry.dll
    const targetTelemetryDllPath = path.join(getPluginsDirectory(setup.dataDir), FILES.TELEMETRY_DLL);
    removeFileOrDirIfExists(
      targetTelemetryDllPath,
      'Removed telemetry.dll from plugins folder.',
      'telemetry.dll not found in plugins folder.'
    );

    // 3. Remove ProgramData/TrackSim
    const gameProgramDataDirectory = getProgramDataDirectory(setup.prefixDir);
    removeFileOrDirIfExists(
      gameProgramDataDirectory,
      'Removed TrackSim directory from ProgramData.',
      'TrackSim directory not found in ProgramData.'
    );

    // 4. Clean up configuration block
    if (configurationData.games && configurationData.games[setup.game.id]) {
       delete configurationData.games[setup.game.id];
       saveConfiguration(configurationData);
    }

    // 5. Clean up downloaded files if no games left
    if (!configurationData.games || Object.keys(configurationData.games).length === 0) {
      if (fs.existsSync(configurationDirectory)) {
        fs.removeSync(configurationDirectory);
        console.log(chalk.greenBright('✓ Removed local configuration and downloaded files.'));
      }
    }

    console.log(chalk.magenta('\nUninstallation finished!'));

  } catch (error) {
    console.error(chalk.red('\nError:'), error.message);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}


