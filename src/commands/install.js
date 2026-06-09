import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import { getConfiguration, createDefaultConfiguration, downloadDirectory } from '../config.js';
import { downloadRemoteFile } from '../utils.js';

export default async function installCommand() {
  try {
    let configurationData = getConfiguration();
    if (!configurationData) {
      configurationData = createDefaultConfiguration();
    }

    console.log(chalk.blueBright('Connecting to Tracksim API...'));
    const { data: apiResponseData } = await axios.get('https://api.tracksim.app/tracker/latest-version', { family: 4 });
    const downloadBaseUrl = apiResponseData.download_url;

    console.log(chalk.green(`Found version: ${apiResponseData.version} (${apiResponseData.branch})\n`));
    
    fs.ensureDirSync(downloadDirectory);

    for (const remoteFile of apiResponseData.files) {
      await downloadRemoteFile(downloadBaseUrl, remoteFile.filename);
    }
    
    console.log(chalk.greenBright('\nDownload complete!'));
    console.log(chalk.yellow('Proceeding with installation...'));
    
    const gamePluginsDirectory = path.join(configurationData.ets2DataDir, 'bin', 'win_x64', 'plugins');
    fs.ensureDirSync(gamePluginsDirectory);

    const downloadedTelemetryDllPath = path.join(downloadDirectory, 'telemetry.dll');
    const targetTelemetryDllPath = path.join(gamePluginsDirectory, 'telemetry.dll');

    if (fs.existsSync(downloadedTelemetryDllPath)) {
      fs.copyFileSync(downloadedTelemetryDllPath, targetTelemetryDllPath);
      console.log(chalk.greenBright(`✓ telemetry.dll successfully copied to plugins folder.`));
    } else {
      throw new Error('telemetry.dll not found in downloaded files!');
    }

    const downloadedTracksimExePath = path.join(downloadDirectory, 'tracksim.exe');
    const downloadedUpdaterExePath = path.join(downloadDirectory, 'updater.exe');
    
    const gameProgramDataDirectory = path.join(configurationData.ets2PrefixDir, 'drive_c', 'ProgramData', 'TrackSim');
    fs.ensureDirSync(gameProgramDataDirectory);
    
    const targetTracksimExePath = path.join(gameProgramDataDirectory, 'tracksim.exe');
    const targetUpdaterExePath = path.join(gameProgramDataDirectory, 'updater.exe');
    
    if (fs.existsSync(downloadedTracksimExePath)) {
      fs.copyFileSync(downloadedTracksimExePath, targetTracksimExePath);
      console.log(chalk.greenBright(`✓ tracksim.exe successfully copied to ProgramData folder.`));
    } else {
      console.log(chalk.red('Warning: tracksim.exe not found in downloaded files!'));
    }

    if (fs.existsSync(downloadedUpdaterExePath)) {
      fs.copyFileSync(downloadedUpdaterExePath, targetUpdaterExePath);
      console.log(chalk.greenBright(`✓ updater.exe successfully copied to ProgramData folder.`));
    } else {
      console.log(chalk.red('Warning: updater.exe not found in downloaded files!'));
    }

    console.log(chalk.magenta('\nInstallation finished!'));

  } catch (installationError) {
    console.error(chalk.red('\nError:'), installationError.stack);
  }
}
