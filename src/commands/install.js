import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import { getConfiguration, saveConfiguration, downloadDirectory } from '../config.js';
import { resolveGameSetup, getPluginsDirectory, getProgramDataDirectory } from '../gamePathResolver.js';
import { downloadRemoteFile, copyFileIfExists } from '../utils.js';
import { TRACKSIM_API_URL, FILES } from '../constants.js';

export default async function installCommand(gameId, options) {
  try {
    const configurationData = getConfiguration();
    
    // 1. Resolve Setup
    const setup = resolveGameSetup(gameId, options, configurationData);
    
    console.log(chalk.cyan(`Game Data Directory: ${setup.dataDir}`));
    if (!setup.isWin) {
      console.log(chalk.cyan(`Proton Prefix Directory: ${setup.prefixDir}`));
    }

    // 2. Save Configuration
    if (!configurationData.games) configurationData.games = {};
    configurationData.games[setup.game.id] = { dataDir: setup.dataDir, prefixDir: setup.prefixDir };
    saveConfiguration(configurationData);

    // 3. Download API Data
    console.log(chalk.blueBright('\nConnecting to Tracksim API...'));
    const { data: apiResponseData } = await axios.get(TRACKSIM_API_URL, { family: 4 });
    const downloadBaseUrl = apiResponseData.download_url;

    console.log(chalk.green(`Found version: ${apiResponseData.version} (${apiResponseData.branch})\n`));
    
    fs.ensureDirSync(downloadDirectory);

    // 4. Download Files
    for (const remoteFile of apiResponseData.files) {
      await downloadRemoteFile(downloadBaseUrl, remoteFile.filename);
    }
    
    console.log(chalk.greenBright('\nDownload complete!'));
    console.log(chalk.yellow('Proceeding with installation...'));
    
    // 5. Install telemetry.dll
    const gamePluginsDirectory = getPluginsDirectory(setup.dataDir);
    fs.ensureDirSync(gamePluginsDirectory);

    copyFileIfExists(
      path.join(downloadDirectory, FILES.TELEMETRY_DLL),
      path.join(gamePluginsDirectory, FILES.TELEMETRY_DLL),
      `${FILES.TELEMETRY_DLL} successfully copied to plugins folder.`,
      `telemetry.dll not found in downloaded files!`
    );

    // 6. Install tracksim.exe and updater.exe
    const gameProgramDataDirectory = getProgramDataDirectory(setup.prefixDir);
    fs.ensureDirSync(gameProgramDataDirectory);
    
    copyFileIfExists(
      path.join(downloadDirectory, FILES.TRACKSIM_EXE),
      path.join(gameProgramDataDirectory, FILES.TRACKSIM_EXE),
      `${FILES.TRACKSIM_EXE} successfully copied to ProgramData folder.`,
      `Warning: ${FILES.TRACKSIM_EXE} not found in downloaded files!`
    );

    copyFileIfExists(
      path.join(downloadDirectory, FILES.UPDATER_EXE),
      path.join(gameProgramDataDirectory, FILES.UPDATER_EXE),
      `${FILES.UPDATER_EXE} successfully copied to ProgramData folder.`,
      `Warning: ${FILES.UPDATER_EXE} not found in downloaded files!`
    );

    console.log(chalk.magenta('\nInstallation finished!'));

  } catch (error) {
    console.error(chalk.red('\nError:'), error.message);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}


